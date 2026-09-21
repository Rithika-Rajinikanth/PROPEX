-- Test pgvector installation
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM pg_extension WHERE extname = 'vector') = 1,
        'pgvector extension should be installed';
END $$;

-- Test embedding column exists
DO $$
BEGIN
    ASSERT (
        SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE table_name = 'regions' AND column_name = 'embedding'
    ) = 1, 'embedding column should exist';
END $$;

-- Test embedding index exists
DO $$
BEGIN
    ASSERT (
        SELECT COUNT(*) 
        FROM pg_indexes 
        WHERE tablename = 'regions' AND indexname = 'idx_regions_embedding'
    ) = 1, 'embedding index should exist';
END $$;

-- Test vector similarity search
DO $$
DECLARE
    test_embedding vector(384);
    result_count integer;
BEGIN
    -- Create a test embedding (all zeros for simplicity)
    test_embedding := array_fill(0.0, ARRAY[384])::vector(384);
    
    -- Test similarity search
    SELECT COUNT(*) INTO result_count
    FROM regions
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> test_embedding
    LIMIT 10;
    
    ASSERT result_count > 0, 'Should find similar regions';
END $$;

-- Test that embeddings are normalized
DO $$
DECLARE
    mag float;
BEGIN
    SELECT AVG(
        (SELECT SUM(val * val) FROM unnest(embedding) as val)
    ) INTO mag
    FROM regions 
    WHERE embedding IS NOT NULL
    LIMIT 100;
    
    -- Normalized vectors should have magnitude ~1.0
    ASSERT ABS(mag - 1.0) < 0.1, 'Embeddings should be normalized';
END $$;