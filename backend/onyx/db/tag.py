from sqlalchemy import and_
from sqlalchemy import delete
from sqlalchemy import or_
from sqlalchemy import select
from sqlalchemy import func
from sqlalchemy import literal_column
from sqlalchemy.orm import Session

from onyx.configs.constants import DocumentSource
from onyx.db.models import Document
from onyx.db.models import Document__Tag
from onyx.db.models import Tag
from onyx.utils.logger import setup_logger

logger = setup_logger()


def check_tag_validity(tag_key: str, tag_value: str) -> bool:
    """If a tag is too long, it should not be used (it will cause an error in Postgres
    as the unique constraint can only apply to entries that are less than 2704 bytes).

    Additionally, extremely long tags are not really usable / useful."""
    if len(tag_key) + len(tag_value) > 255:
        logger.error(
            f"Tag with key '{tag_key}' and value '{tag_value}' is too long, cannot be used"
        )
        return False

    return True


def create_or_add_document_tag(
    tag_key: str,
    tag_value: str,
    source: DocumentSource,
    document_id: str,
    db_session: Session,
) -> Tag | None:
    if not check_tag_validity(tag_key, tag_value):
        return None

    document = db_session.get(Document, document_id)
    if not document:
        raise ValueError("Invalid Document, cannot attach Tags")

    tag_stmt = select(Tag).where(
        Tag.tag_key == tag_key,
        Tag.tag_value == tag_value,
        Tag.source == source,
    )
    tag = db_session.execute(tag_stmt).scalar_one_or_none()

    if not tag:
        tag = Tag(tag_key=tag_key, tag_value=tag_value, source=source)
        db_session.add(tag)

    if tag not in document.tags:
        document.tags.append(tag)

    db_session.commit()
    return tag


def create_or_add_document_tag_list(
    tag_key: str,
    tag_values: list[str],
    source: DocumentSource,
    document_id: str,
    db_session: Session,
) -> list[Tag]:
    valid_tag_values = [
        tag_value for tag_value in tag_values if check_tag_validity(tag_key, tag_value)
    ]
    if not valid_tag_values:
        return []

    document = db_session.get(Document, document_id)
    if not document:
        raise ValueError("Invalid Document, cannot attach Tags")

    existing_tags_stmt = select(Tag).where(
        Tag.tag_key == tag_key,
        Tag.tag_value.in_(valid_tag_values),
        Tag.source == source,
    )
    existing_tags = list(db_session.execute(existing_tags_stmt).scalars().all())
    existing_tag_values = {tag.tag_value for tag in existing_tags}

    new_tags = []
    for tag_value in valid_tag_values:
        if tag_value not in existing_tag_values:
            new_tag = Tag(tag_key=tag_key, tag_value=tag_value, source=source)
            db_session.add(new_tag)
            new_tags.append(new_tag)
            existing_tag_values.add(tag_value)

    if new_tags:
        logger.debug(
            f"Created new tags: {', '.join([f'{tag.tag_key}:{tag.tag_value}' for tag in new_tags])}"
        )

    all_tags = existing_tags + new_tags

    for tag in all_tags:
        if tag not in document.tags:
            document.tags.append(tag)

    db_session.commit()
    return all_tags


def find_tags(
    db_session: Session,
    limit: int | None,
    sources: list[DocumentSource] | None = None,
    exact_tag_key: str | None = None,
    tag_key_fuzzy_pattern: str | None = None,
    tag_value_fuzzy_pattern: str | None = None,
    offset: int = 0,
    count_only: bool = False,
) -> list[Tag] | int:
    if count_only:
        if exact_tag_key:
            count_stmt = (
                select(func.count(func.distinct(Tag.tag_value)))
                .where(Tag.tag_key == exact_tag_key)
            )
            
            if tag_value_fuzzy_pattern:
                count_stmt = count_stmt.where(Tag.tag_value.ilike(f"{tag_value_fuzzy_pattern}%"))
            
            if sources:
                count_stmt = count_stmt.where(Tag.source.in_(sources))
                
            result = db_session.execute(count_stmt).scalar()
            return result or 0
            
        elif tag_key_fuzzy_pattern:
            count_stmt = (
                select(func.count(func.distinct(Tag.tag_key)))
                .where(Tag.tag_key.ilike(f"{tag_key_fuzzy_pattern}%"))
            )
            
            if sources:
                count_stmt = count_stmt.where(Tag.source.in_(sources))
                
            result = db_session.execute(count_stmt).scalar()
            return result or 0
            
        else:
            count_stmt = select(func.count(func.distinct(Tag.tag_key)))
            
            if sources:
                count_stmt = count_stmt.where(Tag.source.in_(sources))
                
            result = db_session.execute(count_stmt).scalar()
            return result or 0

    tags_to_return = []

    if exact_tag_key:
        stmt = (
            select(
                Tag.tag_value,
                func.min(Tag.source).label("source_val") 
            )
            .where(Tag.tag_key == exact_tag_key)
            .group_by(Tag.tag_value)
            .order_by(Tag.tag_value)
        )

        if tag_value_fuzzy_pattern:
            stmt = stmt.where(Tag.tag_value.ilike(f"{tag_value_fuzzy_pattern}%"))
        
        if sources:
            stmt = stmt.where(Tag.source.in_(sources))

        if offset:
            stmt = stmt.offset(offset)
            
        if limit:
            stmt = stmt.limit(limit)

        results = db_session.execute(stmt).all()
        for r_val, r_src in results:
            tags_to_return.append(Tag(tag_key=exact_tag_key, tag_value=r_val, source=r_src))

    elif tag_key_fuzzy_pattern:
        stmt = (
            select(
                Tag.tag_key,
                literal_column("''").label("tag_value_val"),
                func.min(Tag.source).label("source_val")
            )
            .where(Tag.tag_key.ilike(f"{tag_key_fuzzy_pattern}%"))
            .group_by(Tag.tag_key)
            .order_by(Tag.tag_key)
        )
        
        if sources:
            stmt = stmt.where(Tag.source.in_(sources))

        if offset:
            stmt = stmt.offset(offset)
            
        if limit:
            stmt = stmt.limit(limit)

        results = db_session.execute(stmt).all()
        for r_key, _, r_src in results:
            tags_to_return.append(Tag(tag_key=r_key, tag_value="", source=r_src))
            
    else:
        stmt = (
            select(
                Tag.tag_key,
                literal_column("''").label("tag_value_val"),
                func.min(Tag.source).label("source_val")
            )
            .group_by(Tag.tag_key)
            .order_by(Tag.tag_key)
        )
        if sources:
            stmt = stmt.where(Tag.source.in_(sources))

        if offset:
            stmt = stmt.offset(offset)
            
        if limit:
            stmt = stmt.limit(limit)
        
        results = db_session.execute(stmt).all()
        for r_key, _, r_src in results:
            tags_to_return.append(Tag(tag_key=r_key, tag_value="", source=r_src))
            
    return tags_to_return


def delete_document_tags_for_documents__no_commit(
    document_ids: list[str], db_session: Session
) -> None:
    stmt = delete(Document__Tag).where(Document__Tag.document_id.in_(document_ids))
    db_session.execute(stmt)


def delete_orphan_tags__no_commit(db_session: Session) -> None:
    orphan_tags_query = select(Tag.id).where(
        ~db_session.query(Document__Tag.tag_id)
        .filter(Document__Tag.tag_id == Tag.id)
        .exists()
    )

    orphan_tags = db_session.execute(orphan_tags_query).scalars().all()

    if orphan_tags:
        delete_orphan_tags_stmt = delete(Tag).where(Tag.id.in_(orphan_tags))
        db_session.execute(delete_orphan_tags_stmt)
