import json
import re
import logging

from app.models import MasterCategoryMapping
from openai import OpenAI

from django.conf import settings
from django.utils.text import slugify

logger = logging.getLogger("ai_variation") 

client = OpenAI(api_key=settings.OPEN_AI_KEY)

def success_response(data, message = None):
    return {"status": True, "data":data, "message":message}

def error_response(message):
    return {"status": False, "message":message}

def generate_variation_with_gpt(
    title,
    short_desc,
    desc,
    prompt_text,
    meta_title=None,
    slug=None,
    portal_name=None,
):
    """
    Generate rephrased version of news fields using GPT.
    Returns (title, short_desc, desc, meta_title, slug) or None if failed.
    Safe JSON parsing + resilience for dict/list/nested dict payloads.
    """
    logger.info("Started AI generation for portal: %s", portal_name)

    base_meta = meta_title or title or ""
    base_slug = slug or slugify(base_meta) or ""

    user_content = f"""
Rewrite the following news content for the portal.
Each portal must have a unique variation of the rewritten content.

Rules:
- Preserve all HTML tags, attributes, styles, images, links, lists, and formatting inside the description.
- Rewrite the textual content for: title, short_description, description, and meta_title.
- short_description must be 1–2 sentences (<160 chars) summarizing the rewritten description.
- Generate a slug as a clean, URL-safe version of the rewritten meta_title (lowercase, hyphen separated).
- Ensure wording differs slightly for each portal, but keep meaning intact.
- Do not remove, add, or modify any HTML structure.

Return ONLY valid JSON with keys: title, short_description, description, meta_title, slug.

{{
  "title": "{(title or '').replace('"','\\\"')}",
  "short_description": "{(short_desc or '').replace('"','\\\"')}",
  "description": "{(desc or '').replace('"','\\\"')}",
  "meta_title": "{(base_meta or '').replace('"','\\\"')}",
  "slug": "{(base_slug or '').replace('"','\\\"')}"
}}
"""

    try:
        # NOTE: your client call kept as-is; add a light timeout if your SDK supports it.
        response = client.responses.create(
            model="gpt-5-mini",
            input=[
                {"role": "developer", "content": prompt_text},
                {"role": "user", "content": user_content},
            ],
        )

        content = (response.output_text or "").strip()
        logger.info("Raw GPT response (first 500 chars): %s", content[:500])

        # ---- Safe JSON parsing with greedy fallback ----
        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            import re
            match = re.search(r"\{[\s\S]*\}|\[[\s\S]*\]", content)
            if not match:
                raise ValueError("No valid JSON structure in GPT response")
            data = json.loads(match.group(0))

        # If list, take first
        if isinstance(data, list):
            if not data:
                raise ValueError("Empty list in GPT response")
            data = data[0]

        # If nested dict (e.g., {"domain.com": {...}})
        if isinstance(data, dict):
            keys = list(data.keys())
            known = {"title", "short_description", "description", "meta_title", "slug"}
            if keys and not (set(keys) & known):
                # pick the first inner dict if shape is {something: {...}}
                inner = data.get(keys[0], {})
                if isinstance(inner, dict):
                    data = inner

        # Final validation
        for k in ["title", "short_description", "description", "meta_title", "slug"]:
            if k not in data or not data[k]:
                raise ValueError(f"Missing/empty key '{k}' in GPT response")

        logger.info("Successfully generated AI variation for %s", portal_name)

        return (
            data.get("title") or title or "",
            data.get("short_description") or short_desc or "",
            data.get("description") or desc or "",
            data.get("meta_title") or base_meta,
            data.get("slug") or base_slug,
        )

    except Exception as e:
        logger.exception("AI generation failed for %s: %s", portal_name, str(e))
        return None
def get_portals_from_assignment(assignment):
    """
    Given a UserCategoryGroupAssignment, return all (portal, portal_category) pairs.
    """
    portals = []

    # Case 1: Assignment is for a single master_category
    if assignment.master_category:
        mappings = MasterCategoryMapping.objects.filter(
            master_category=assignment.master_category
        ).select_related("portal_category__portal")
        for mapping in mappings:
            portals.append((mapping.portal_category.portal, mapping.portal_category))

    # Case 2: Assignment is for a group (iterate over its master categories)
    if assignment.group:
        for mc in assignment.group.master_categories.all():
            mappings = MasterCategoryMapping.objects.filter(
                master_category=mc
            ).select_related("portal_category__portal")
            for mapping in mappings:
                portals.append((mapping.portal_category.portal, mapping.portal_category))

    return portals
