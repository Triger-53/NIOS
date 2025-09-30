-- SQL query to create the 'books' table in Supabase

CREATE TABLE books (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    subject text NOT NULL,
    book_title text NOT NULL,
    chunk_index integer NOT NULL,
    content jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);