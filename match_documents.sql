-- Create a function to search for documents
create function match_documents (
  match_count int,
  match_threshold float,
  query_embedding vector(768)
)
returns table (
  id bigint,
  content text,
  book_title text,
  page_number int,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    knowledge_base.id,
    knowledge_base.content,
    knowledge_base.book_title,
    knowledge_base.page_number,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  from knowledge_base
  where 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;
