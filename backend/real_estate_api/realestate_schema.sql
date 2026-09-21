--
-- PostgreSQL database dump
--

\restrict KQD9gFet93XX76BgUQKCs7SM6iFJUL2eGsCWOudpyf5iAcGCbbhhxxnDXQGljUC

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: refresh_all_materialized_views(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.refresh_all_materialized_views() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_region_latest_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_search_optimized;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_region_data_counts;
    RAISE NOTICE 'All materialized views refreshed successfully';
END;
$$;


--
-- Name: refresh_materialized_views(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.refresh_materialized_views() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW mv_region_latest_metrics;
    REFRESH MATERIALIZED VIEW mv_search_optimized;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _sqlx_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._sqlx_migrations (
    version bigint NOT NULL,
    description text NOT NULL,
    installed_on timestamp with time zone DEFAULT now() NOT NULL,
    success boolean NOT NULL,
    checksum bytea NOT NULL,
    execution_time bigint NOT NULL
);


--
-- Name: affordability_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affordability_metrics (
    id integer NOT NULL,
    region_id integer,
    date date NOT NULL,
    affordable_home_price numeric(12,2),
    homeowner_income_needed numeric(12,2),
    renter_income_needed numeric(12,2),
    years_to_save numeric(8,2),
    affordability_ratio numeric(8,4),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: affordability_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.affordability_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: affordability_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.affordability_metrics_id_seq OWNED BY public.affordability_metrics.id;


--
-- Name: for_sale_listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.for_sale_listings (
    id integer NOT NULL,
    region_id integer,
    date date NOT NULL,
    new_listings integer,
    inventory integer,
    median_list_price numeric(12,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: for_sale_listings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.for_sale_listings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: for_sale_listings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.for_sale_listings_id_seq OWNED BY public.for_sale_listings.id;


--
-- Name: market_heat_index; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.market_heat_index (
    id integer NOT NULL,
    region_id integer,
    date date NOT NULL,
    heat_index numeric(8,4),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: market_timing_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.market_timing_metrics (
    id integer NOT NULL,
    region_id integer,
    date date NOT NULL,
    days_to_pending numeric(8,2),
    days_to_close numeric(8,2),
    price_cut_share numeric(6,4),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: regions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regions (
    id integer NOT NULL,
    region_name character varying(255) NOT NULL,
    region_type character varying(50),
    state_name character varying(100),
    geometry public.geography(Point,4326),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    embedding public.vector(384)
);


--
-- Name: sales_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_metrics (
    id integer NOT NULL,
    region_id integer,
    date date NOT NULL,
    sales_count integer,
    median_sale_price numeric(12,2),
    transaction_value bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: zhvi_home_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zhvi_home_values (
    id integer NOT NULL,
    region_id integer,
    date date NOT NULL,
    zhvi_mid_tier numeric(12,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: latest_market_data; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.latest_market_data AS
 SELECT DISTINCT ON (r.id) r.id AS region_id,
    r.region_name,
    r.state_name,
    zh.date AS latest_date,
    zh.zhvi_mid_tier,
    sl.median_list_price,
    sl.inventory,
    sm.median_sale_price,
    mt.days_to_pending,
    mh.heat_index
   FROM (((((public.regions r
     LEFT JOIN public.zhvi_home_values zh ON ((r.id = zh.region_id)))
     LEFT JOIN public.for_sale_listings sl ON (((r.id = sl.region_id) AND (zh.date = sl.date))))
     LEFT JOIN public.sales_metrics sm ON (((r.id = sm.region_id) AND (zh.date = sm.date))))
     LEFT JOIN public.market_timing_metrics mt ON (((r.id = mt.region_id) AND (zh.date = mt.date))))
     LEFT JOIN public.market_heat_index mh ON (((r.id = mh.region_id) AND (zh.date = mh.date))))
  ORDER BY r.id, zh.date DESC NULLS LAST;


--
-- Name: market_heat_index_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.market_heat_index_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: market_heat_index_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.market_heat_index_id_seq OWNED BY public.market_heat_index.id;


--
-- Name: market_timing_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.market_timing_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: market_timing_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.market_timing_metrics_id_seq OWNED BY public.market_timing_metrics.id;


--
-- Name: mv_region_data_counts; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.mv_region_data_counts AS
 SELECT id AS region_id,
    region_name,
    state_name,
    ( SELECT count(*) AS count
           FROM public.zhvi_home_values
          WHERE (zhvi_home_values.region_id = r.id)) AS zhvi_count,
    ( SELECT count(*) AS count
           FROM public.market_heat_index
          WHERE (market_heat_index.region_id = r.id)) AS heat_count,
    ( SELECT count(*) AS count
           FROM public.for_sale_listings
          WHERE (for_sale_listings.region_id = r.id)) AS listings_count,
    ( SELECT max(zhvi_home_values.date) AS max
           FROM public.zhvi_home_values
          WHERE (zhvi_home_values.region_id = r.id)) AS latest_zhvi_date,
    ( SELECT max(market_heat_index.date) AS max
           FROM public.market_heat_index
          WHERE (market_heat_index.region_id = r.id)) AS latest_heat_date,
    now() AS computed_at
   FROM public.regions r
  WITH NO DATA;


--
-- Name: mv_region_latest_metrics; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.mv_region_latest_metrics AS
 SELECT id AS region_id,
    region_name,
    state_name,
    region_type,
    ( SELECT (zh.zhvi_mid_tier)::double precision AS zhvi_mid_tier
           FROM public.zhvi_home_values zh
          WHERE ((zh.region_id = r.id) AND (zh.zhvi_mid_tier IS NOT NULL))
          ORDER BY zh.date DESC
         LIMIT 1) AS current_value,
    ( SELECT (fsl.median_list_price)::double precision AS median_list_price
           FROM public.for_sale_listings fsl
          WHERE (fsl.region_id = r.id)
          ORDER BY fsl.date DESC
         LIMIT 1) AS median_list_price,
    ( SELECT (sm.median_sale_price)::double precision AS median_sale_price
           FROM public.sales_metrics sm
          WHERE (sm.region_id = r.id)
          ORDER BY sm.date DESC
         LIMIT 1) AS median_sale_price,
    ( SELECT fsl.inventory
           FROM public.for_sale_listings fsl
          WHERE (fsl.region_id = r.id)
          ORDER BY fsl.date DESC
         LIMIT 1) AS inventory,
    ( SELECT fsl.new_listings
           FROM public.for_sale_listings fsl
          WHERE (fsl.region_id = r.id)
          ORDER BY fsl.date DESC
         LIMIT 1) AS new_listings,
    ( SELECT sm.sales_count
           FROM public.sales_metrics sm
          WHERE (sm.region_id = r.id)
          ORDER BY sm.date DESC
         LIMIT 1) AS sales_count,
    ( SELECT (mtm.days_to_pending)::double precision AS days_to_pending
           FROM public.market_timing_metrics mtm
          WHERE (mtm.region_id = r.id)
          ORDER BY mtm.date DESC
         LIMIT 1) AS days_to_pending,
    ( SELECT (mtm.days_to_close)::double precision AS days_to_close
           FROM public.market_timing_metrics mtm
          WHERE (mtm.region_id = r.id)
          ORDER BY mtm.date DESC
         LIMIT 1) AS days_to_close,
    ( SELECT (mhi.heat_index)::double precision AS heat_index
           FROM public.market_heat_index mhi
          WHERE (mhi.region_id = r.id)
          ORDER BY mhi.date DESC
         LIMIT 1) AS heat_index,
    ( SELECT (am.affordability_ratio)::double precision AS affordability_ratio
           FROM public.affordability_metrics am
          WHERE (am.region_id = r.id)
          ORDER BY am.date DESC
         LIMIT 1) AS affordability_ratio,
    ( SELECT max(zh.date) AS max
           FROM public.zhvi_home_values zh
          WHERE (zh.region_id = r.id)) AS last_updated
   FROM public.regions r
  WITH NO DATA;


--
-- Name: mv_search_optimized; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.mv_search_optimized AS
 SELECT id AS region_id,
    region_name,
    state_name,
    region_type,
    ( SELECT (zh.zhvi_mid_tier)::double precision AS zhvi_mid_tier
           FROM public.zhvi_home_values zh
          WHERE ((zh.region_id = r.id) AND (zh.zhvi_mid_tier IS NOT NULL))
          ORDER BY zh.date DESC
         LIMIT 1) AS current_value,
    ( SELECT (fsl.median_list_price)::double precision AS median_list_price
           FROM public.for_sale_listings fsl
          WHERE (fsl.region_id = r.id)
          ORDER BY fsl.date DESC
         LIMIT 1) AS median_list_price,
    ( SELECT (sm.median_sale_price)::double precision AS median_sale_price
           FROM public.sales_metrics sm
          WHERE (sm.region_id = r.id)
          ORDER BY sm.date DESC
         LIMIT 1) AS median_sale_price,
    ( SELECT fsl.inventory
           FROM public.for_sale_listings fsl
          WHERE (fsl.region_id = r.id)
          ORDER BY fsl.date DESC
         LIMIT 1) AS inventory,
    ( SELECT fsl.new_listings
           FROM public.for_sale_listings fsl
          WHERE (fsl.region_id = r.id)
          ORDER BY fsl.date DESC
         LIMIT 1) AS new_listings,
    ( SELECT sm.sales_count
           FROM public.sales_metrics sm
          WHERE (sm.region_id = r.id)
          ORDER BY sm.date DESC
         LIMIT 1) AS sales_count,
    ( SELECT (mtm.days_to_pending)::double precision AS days_to_pending
           FROM public.market_timing_metrics mtm
          WHERE (mtm.region_id = r.id)
          ORDER BY mtm.date DESC
         LIMIT 1) AS days_to_pending,
    ( SELECT (mtm.days_to_close)::double precision AS days_to_close
           FROM public.market_timing_metrics mtm
          WHERE (mtm.region_id = r.id)
          ORDER BY mtm.date DESC
         LIMIT 1) AS days_to_close,
    ( SELECT (mhi.heat_index)::double precision AS heat_index
           FROM public.market_heat_index mhi
          WHERE (mhi.region_id = r.id)
          ORDER BY mhi.date DESC
         LIMIT 1) AS heat_index,
    ( SELECT (am.affordability_ratio)::double precision AS affordability_ratio
           FROM public.affordability_metrics am
          WHERE (am.region_id = r.id)
          ORDER BY am.date DESC
         LIMIT 1) AS affordability_ratio,
    ( SELECT max(zh.date) AS max
           FROM public.zhvi_home_values zh
          WHERE (zh.region_id = r.id)) AS last_updated,
    NULL::public.vector(384) AS embedding
   FROM public.regions r
  WITH NO DATA;


--
-- Name: new_construction_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.new_construction_metrics (
    id integer NOT NULL,
    region_id integer,
    date date NOT NULL,
    sales_count integer,
    median_sale_price numeric(12,2),
    price_per_sqft numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: new_construction_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.new_construction_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: new_construction_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.new_construction_metrics_id_seq OWNED BY public.new_construction_metrics.id;


--
-- Name: regions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.regions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: regions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.regions_id_seq OWNED BY public.regions.id;


--
-- Name: sales_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sales_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sales_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sales_metrics_id_seq OWNED BY public.sales_metrics.id;


--
-- Name: saved_properties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_properties (
    id integer NOT NULL,
    user_id integer,
    region_id integer,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: saved_properties_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.saved_properties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: saved_properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.saved_properties_id_seq OWNED BY public.saved_properties.id;


--
-- Name: search_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_history (
    id integer NOT NULL,
    user_id integer,
    query text,
    filters jsonb,
    results_count integer,
    searched_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: search_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.search_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: search_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.search_history_id_seq OWNED BY public.search_history.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    name character varying(255),
    preferences jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: zhvi_forecasts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zhvi_forecasts (
    id integer NOT NULL,
    region_id integer,
    date date NOT NULL,
    yoy_growth_pct numeric(8,4),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: zhvi_forecasts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.zhvi_forecasts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: zhvi_forecasts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.zhvi_forecasts_id_seq OWNED BY public.zhvi_forecasts.id;


--
-- Name: zhvi_home_values_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.zhvi_home_values_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: zhvi_home_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.zhvi_home_values_id_seq OWNED BY public.zhvi_home_values.id;


--
-- Name: zorf_forecasts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zorf_forecasts (
    id integer NOT NULL,
    region_id integer,
    date date NOT NULL,
    yoy_growth_pct numeric(8,4),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: zorf_forecasts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.zorf_forecasts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: zorf_forecasts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.zorf_forecasts_id_seq OWNED BY public.zorf_forecasts.id;


--
-- Name: affordability_metrics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affordability_metrics ALTER COLUMN id SET DEFAULT nextval('public.affordability_metrics_id_seq'::regclass);


--
-- Name: for_sale_listings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.for_sale_listings ALTER COLUMN id SET DEFAULT nextval('public.for_sale_listings_id_seq'::regclass);


--
-- Name: market_heat_index id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_heat_index ALTER COLUMN id SET DEFAULT nextval('public.market_heat_index_id_seq'::regclass);


--
-- Name: market_timing_metrics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_timing_metrics ALTER COLUMN id SET DEFAULT nextval('public.market_timing_metrics_id_seq'::regclass);


--
-- Name: new_construction_metrics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.new_construction_metrics ALTER COLUMN id SET DEFAULT nextval('public.new_construction_metrics_id_seq'::regclass);


--
-- Name: regions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regions ALTER COLUMN id SET DEFAULT nextval('public.regions_id_seq'::regclass);


--
-- Name: sales_metrics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_metrics ALTER COLUMN id SET DEFAULT nextval('public.sales_metrics_id_seq'::regclass);


--
-- Name: saved_properties id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_properties ALTER COLUMN id SET DEFAULT nextval('public.saved_properties_id_seq'::regclass);


--
-- Name: search_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_history ALTER COLUMN id SET DEFAULT nextval('public.search_history_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: zhvi_forecasts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zhvi_forecasts ALTER COLUMN id SET DEFAULT nextval('public.zhvi_forecasts_id_seq'::regclass);


--
-- Name: zhvi_home_values id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zhvi_home_values ALTER COLUMN id SET DEFAULT nextval('public.zhvi_home_values_id_seq'::regclass);


--
-- Name: zorf_forecasts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zorf_forecasts ALTER COLUMN id SET DEFAULT nextval('public.zorf_forecasts_id_seq'::regclass);


--
-- Name: _sqlx_migrations _sqlx_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._sqlx_migrations
    ADD CONSTRAINT _sqlx_migrations_pkey PRIMARY KEY (version);


--
-- Name: affordability_metrics affordability_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affordability_metrics
    ADD CONSTRAINT affordability_metrics_pkey PRIMARY KEY (id);


--
-- Name: affordability_metrics affordability_metrics_region_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affordability_metrics
    ADD CONSTRAINT affordability_metrics_region_id_date_key UNIQUE (region_id, date);


--
-- Name: for_sale_listings for_sale_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.for_sale_listings
    ADD CONSTRAINT for_sale_listings_pkey PRIMARY KEY (id);


--
-- Name: for_sale_listings for_sale_listings_region_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.for_sale_listings
    ADD CONSTRAINT for_sale_listings_region_id_date_key UNIQUE (region_id, date);


--
-- Name: market_heat_index market_heat_index_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_heat_index
    ADD CONSTRAINT market_heat_index_pkey PRIMARY KEY (id);


--
-- Name: market_heat_index market_heat_index_region_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_heat_index
    ADD CONSTRAINT market_heat_index_region_id_date_key UNIQUE (region_id, date);


--
-- Name: market_timing_metrics market_timing_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_timing_metrics
    ADD CONSTRAINT market_timing_metrics_pkey PRIMARY KEY (id);


--
-- Name: market_timing_metrics market_timing_metrics_region_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_timing_metrics
    ADD CONSTRAINT market_timing_metrics_region_id_date_key UNIQUE (region_id, date);


--
-- Name: new_construction_metrics new_construction_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.new_construction_metrics
    ADD CONSTRAINT new_construction_metrics_pkey PRIMARY KEY (id);


--
-- Name: new_construction_metrics new_construction_metrics_region_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.new_construction_metrics
    ADD CONSTRAINT new_construction_metrics_region_id_date_key UNIQUE (region_id, date);


--
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (id);


--
-- Name: regions regions_region_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_region_name_key UNIQUE (region_name);


--
-- Name: sales_metrics sales_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_metrics
    ADD CONSTRAINT sales_metrics_pkey PRIMARY KEY (id);


--
-- Name: sales_metrics sales_metrics_region_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_metrics
    ADD CONSTRAINT sales_metrics_region_id_date_key UNIQUE (region_id, date);


--
-- Name: saved_properties saved_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_properties
    ADD CONSTRAINT saved_properties_pkey PRIMARY KEY (id);


--
-- Name: search_history search_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: zhvi_forecasts zhvi_forecasts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zhvi_forecasts
    ADD CONSTRAINT zhvi_forecasts_pkey PRIMARY KEY (id);


--
-- Name: zhvi_forecasts zhvi_forecasts_region_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zhvi_forecasts
    ADD CONSTRAINT zhvi_forecasts_region_id_date_key UNIQUE (region_id, date);


--
-- Name: zhvi_home_values zhvi_home_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zhvi_home_values
    ADD CONSTRAINT zhvi_home_values_pkey PRIMARY KEY (id);


--
-- Name: zhvi_home_values zhvi_home_values_region_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zhvi_home_values
    ADD CONSTRAINT zhvi_home_values_region_id_date_key UNIQUE (region_id, date);


--
-- Name: zorf_forecasts zorf_forecasts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zorf_forecasts
    ADD CONSTRAINT zorf_forecasts_pkey PRIMARY KEY (id);


--
-- Name: zorf_forecasts zorf_forecasts_region_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zorf_forecasts
    ADD CONSTRAINT zorf_forecasts_region_id_date_key UNIQUE (region_id, date);


--
-- Name: idx_afford_region_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_afford_region_date ON public.affordability_metrics USING btree (region_id, date);


--
-- Name: idx_afford_region_date_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_afford_region_date_desc ON public.affordability_metrics USING btree (region_id, date DESC);


--
-- Name: idx_am_region_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_am_region_date ON public.affordability_metrics USING btree (region_id, date DESC);


--
-- Name: idx_fsl_region_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fsl_region_date ON public.for_sale_listings USING btree (region_id, date DESC);


--
-- Name: idx_heat_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_heat_date ON public.market_heat_index USING btree (date DESC) WHERE (heat_index IS NOT NULL);


--
-- Name: idx_heat_region_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_heat_region_date ON public.market_heat_index USING btree (region_id, date);


--
-- Name: idx_heat_region_date_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_heat_region_date_desc ON public.market_heat_index USING btree (region_id, date DESC);


--
-- Name: idx_listings_region_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_region_date ON public.for_sale_listings USING btree (region_id, date);


--
-- Name: idx_listings_region_date_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_listings_region_date_desc ON public.for_sale_listings USING btree (region_id, date DESC);


--
-- Name: idx_mhi_region_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mhi_region_date ON public.market_heat_index USING btree (region_id, date DESC);


--
-- Name: idx_mtm_region_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mtm_region_date ON public.market_timing_metrics USING btree (region_id, date DESC);


--
-- Name: idx_mv_counts_region; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mv_counts_region ON public.mv_region_data_counts USING btree (region_id);


--
-- Name: idx_new_con_region_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_new_con_region_date ON public.new_construction_metrics USING btree (region_id, date);


--
-- Name: idx_regions_embedding; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_regions_embedding ON public.regions USING ivfflat (embedding public.vector_cosine_ops) WITH (lists='100');


--
-- Name: idx_regions_geo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_regions_geo ON public.regions USING gist (geometry);


--
-- Name: idx_regions_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_regions_name ON public.regions USING btree (region_name);


--
-- Name: idx_regions_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_regions_state ON public.regions USING btree (state_name);


--
-- Name: idx_regions_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_regions_type ON public.regions USING btree (region_type);


--
-- Name: idx_sales_region_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_region_date ON public.sales_metrics USING btree (region_id, date);


--
-- Name: idx_sales_region_date_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_region_date_desc ON public.sales_metrics USING btree (region_id, date DESC);


--
-- Name: idx_search_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_search_user ON public.search_history USING btree (user_id);


--
-- Name: idx_sm_region_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sm_region_date ON public.sales_metrics USING btree (region_id, date DESC);


--
-- Name: idx_timing_region_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timing_region_date ON public.market_timing_metrics USING btree (region_id, date);


--
-- Name: idx_timing_region_date_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timing_region_date_desc ON public.market_timing_metrics USING btree (region_id, date DESC);


--
-- Name: idx_zhvi_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zhvi_date ON public.zhvi_home_values USING btree (date DESC) WHERE (zhvi_mid_tier IS NOT NULL);


--
-- Name: idx_zhvi_forecast_region_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zhvi_forecast_region_date ON public.zhvi_forecasts USING btree (region_id, date);


--
-- Name: idx_zhvi_region_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zhvi_region_date ON public.zhvi_home_values USING btree (region_id, date);


--
-- Name: idx_zorf_forecast_region_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_zorf_forecast_region_date ON public.zorf_forecasts USING btree (region_id, date);


--
-- Name: regions update_regions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON public.regions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: affordability_metrics affordability_metrics_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affordability_metrics
    ADD CONSTRAINT affordability_metrics_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE CASCADE;


--
-- Name: for_sale_listings for_sale_listings_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.for_sale_listings
    ADD CONSTRAINT for_sale_listings_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE CASCADE;


--
-- Name: market_heat_index market_heat_index_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_heat_index
    ADD CONSTRAINT market_heat_index_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE CASCADE;


--
-- Name: market_timing_metrics market_timing_metrics_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.market_timing_metrics
    ADD CONSTRAINT market_timing_metrics_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE CASCADE;


--
-- Name: new_construction_metrics new_construction_metrics_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.new_construction_metrics
    ADD CONSTRAINT new_construction_metrics_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE CASCADE;


--
-- Name: sales_metrics sales_metrics_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_metrics
    ADD CONSTRAINT sales_metrics_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE CASCADE;


--
-- Name: saved_properties saved_properties_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_properties
    ADD CONSTRAINT saved_properties_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE CASCADE;


--
-- Name: saved_properties saved_properties_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_properties
    ADD CONSTRAINT saved_properties_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: search_history search_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: zhvi_forecasts zhvi_forecasts_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zhvi_forecasts
    ADD CONSTRAINT zhvi_forecasts_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE CASCADE;


--
-- Name: zhvi_home_values zhvi_home_values_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zhvi_home_values
    ADD CONSTRAINT zhvi_home_values_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE CASCADE;


--
-- Name: zorf_forecasts zorf_forecasts_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zorf_forecasts
    ADD CONSTRAINT zorf_forecasts_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict KQD9gFet93XX76BgUQKCs7SM6iFJUL2eGsCWOudpyf5iAcGCbbhhxxnDXQGljUC

