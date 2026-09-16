--
-- PostgreSQL database dump
--

\restrict hRfoa5S7FMu78WBFiWgCbZHgvh3pfAJd9KdduFyXgY3gD1rRFbQQfN96XVciFsU

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

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
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: enum_carts_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_carts_status AS ENUM (
    'ACTIVE',
    'CONVERTED',
    'ABANDONED'
);


ALTER TYPE public.enum_carts_status OWNER TO postgres;

--
-- Name: enum_clients_customerType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_clients_customerType" AS ENUM (
    'PARTICULIER',
    'ENTREPRISE',
    'PARTENAIRE',
    'GROSSISTE'
);


ALTER TYPE public."enum_clients_customerType" OWNER TO postgres;

--
-- Name: enum_clients_type_client; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_clients_type_client AS ENUM (
    'PARTICULIER',
    'ENTREPRISE',
    'PARTENAIRE',
    'GROSSISTE',
    'ENTREPRISE_CLIENT'
);


ALTER TYPE public.enum_clients_type_client OWNER TO postgres;

--
-- Name: enum_demandes_devis_source; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_demandes_devis_source AS ENUM (
    'GUEST',
    'CLIENT'
);


ALTER TYPE public.enum_demandes_devis_source OWNER TO postgres;

--
-- Name: enum_demandes_devis_statut; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_demandes_devis_statut AS ENUM (
    'PENDING',
    'CONTACTED',
    'CONVERTED',
    'CANCELLED'
);


ALTER TYPE public.enum_demandes_devis_statut OWNER TO postgres;

--
-- Name: enum_demandes_produits_statut; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_demandes_produits_statut AS ENUM (
    'PENDING',
    'ANSWERED',
    'ACCEPTED',
    'REJECTED',
    'CONVERTED'
);


ALTER TYPE public.enum_demandes_produits_statut OWNER TO postgres;

--
-- Name: enum_demandes_vehicules_statut; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_demandes_vehicules_statut AS ENUM (
    'PENDING',
    'CONTACTED',
    'CONVERTED',
    'REJECTED'
);


ALTER TYPE public.enum_demandes_vehicules_statut OWNER TO postgres;

--
-- Name: enum_devis_statut; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_devis_statut AS ENUM (
    'DRAFT',
    'ISSUED',
    'ACCEPTED',
    'REJECTED',
    'EXPIRED'
);


ALTER TYPE public.enum_devis_statut OWNER TO postgres;

--
-- Name: enum_mouvements_stock_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_mouvements_stock_type AS ENUM (
    'IN',
    'OUT',
    'ADJUSTMENT'
);


ALTER TYPE public.enum_mouvements_stock_type OWNER TO postgres;

--
-- Name: enum_paniers_statut; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_paniers_statut AS ENUM (
    'ACTIVE',
    'CONVERTED',
    'ABANDONED'
);


ALTER TYPE public.enum_paniers_statut OWNER TO postgres;

--
-- Name: enum_product_requests_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_product_requests_status AS ENUM (
    'PENDING',
    'ANSWERED',
    'ACCEPTED',
    'REJECTED',
    'CONVERTED'
);


ALTER TYPE public.enum_product_requests_status OWNER TO postgres;

--
-- Name: enum_products_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_products_status AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.enum_products_status OWNER TO postgres;

--
-- Name: enum_produits_statut; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_produits_statut AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.enum_produits_statut OWNER TO postgres;

--
-- Name: enum_promotions_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_promotions_status AS ENUM (
    'DRAFT',
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.enum_promotions_status OWNER TO postgres;

--
-- Name: enum_promotions_statut; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_promotions_statut AS ENUM (
    'DRAFT',
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.enum_promotions_statut OWNER TO postgres;

--
-- Name: enum_quote_requests_source; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_quote_requests_source AS ENUM (
    'GUEST',
    'CLIENT'
);


ALTER TYPE public.enum_quote_requests_source OWNER TO postgres;

--
-- Name: enum_quote_requests_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_quote_requests_status AS ENUM (
    'PENDING',
    'CONTACTED',
    'CONVERTED',
    'CANCELLED'
);


ALTER TYPE public.enum_quote_requests_status OWNER TO postgres;

--
-- Name: enum_quotes_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_quotes_status AS ENUM (
    'DRAFT',
    'ISSUED',
    'ACCEPTED',
    'REJECTED',
    'EXPIRED'
);


ALTER TYPE public.enum_quotes_status OWNER TO postgres;

--
-- Name: enum_reservations_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_reservations_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'REJECTED',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public.enum_reservations_status OWNER TO postgres;

--
-- Name: enum_reservations_statut; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_reservations_statut AS ENUM (
    'PENDING',
    'CONFIRMED',
    'REJECTED',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public.enum_reservations_statut OWNER TO postgres;

--
-- Name: enum_stock_movements_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_stock_movements_type AS ENUM (
    'IN',
    'OUT',
    'ADJUSTMENT'
);


ALTER TYPE public.enum_stock_movements_type OWNER TO postgres;

--
-- Name: enum_tariffs_customerType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_tariffs_customerType" AS ENUM (
    'PARTICULIER',
    'ENTREPRISE',
    'PARTENAIRE',
    'GROSSISTE'
);


ALTER TYPE public."enum_tariffs_customerType" OWNER TO postgres;

--
-- Name: enum_tarifs_type_client; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_tarifs_type_client AS ENUM (
    'PARTICULIER',
    'ENTREPRISE',
    'PARTENAIRE',
    'GROSSISTE',
    'ENTREPRISE_CLIENT'
);


ALTER TYPE public.enum_tarifs_type_client OWNER TO postgres;

--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_role AS ENUM (
    'ADMIN',
    'MANAGER',
    'CLIENT'
);


ALTER TYPE public.enum_users_role OWNER TO postgres;

--
-- Name: enum_utilisateurs_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_utilisateurs_role AS ENUM (
    'ADMIN',
    'MANAGER',
    'CLIENT'
);


ALTER TYPE public.enum_utilisateurs_role OWNER TO postgres;

--
-- Name: enum_vehicles_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_vehicles_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'MAINTENANCE'
);


ALTER TYPE public.enum_vehicles_status OWNER TO postgres;

--
-- Name: enum_vehicules_statut; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_vehicules_statut AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'MAINTENANCE'
);


ALTER TYPE public.enum_vehicules_statut OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;

--
-- Name: articles_devis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articles_devis (
    id uuid NOT NULL,
    devis_id uuid NOT NULL,
    produit_id uuid,
    libelle character varying(255) NOT NULL,
    quantite numeric(14,3) NOT NULL,
    prix_unitaire numeric(14,2) NOT NULL,
    prix_total numeric(14,2) NOT NULL,
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.articles_devis OWNER TO postgres;

--
-- Name: articles_panier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articles_panier (
    id uuid NOT NULL,
    panier_id uuid NOT NULL,
    produit_id uuid,
    vehicule_id uuid,
    quantite numeric(14,3) DEFAULT 1 NOT NULL,
    prix_unitaire numeric(14,2) NOT NULL,
    commence_le timestamp with time zone,
    termine_le timestamp with time zone,
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT articles_panier_single_item_kind CHECK ((((produit_id IS NOT NULL) AND (vehicule_id IS NULL)) OR ((produit_id IS NULL) AND (vehicule_id IS NOT NULL))))
);


ALTER TABLE public.articles_panier OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid NOT NULL,
    nom character varying(150) NOT NULL,
    slug character varying(180) NOT NULL,
    description text,
    parent_id uuid,
    est_actif boolean DEFAULT true NOT NULL,
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id uuid NOT NULL,
    utilisateur_id uuid NOT NULL,
    type_client public.enum_clients_type_client NOT NULL,
    prenom character varying(100),
    nom character varying(100),
    adresse text,
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    delai_blocage_jours integer,
    bloque_le timestamp with time zone
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: demandes_devis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demandes_devis (
    id uuid NOT NULL,
    reference character varying(40) NOT NULL,
    client_id uuid,
    utilisateur_id uuid,
    source public.enum_demandes_devis_source DEFAULT 'GUEST'::public.enum_demandes_devis_source NOT NULL,
    service character varying(80) NOT NULL,
    titre character varying(180) NOT NULL,
    budget character varying(80),
    delai character varying(80),
    description text,
    entreprise character varying(180),
    nom character varying(180) NOT NULL,
    email character varying(254) NOT NULL,
    telephone character varying(32) NOT NULL,
    lieu character varying(180) NOT NULL,
    statut character varying(30) DEFAULT 'PENDING'::public.enum_demandes_devis_statut NOT NULL,
    cree_le timestamp with time zone NOT NULL,
    mis_a_jour_le timestamp with time zone NOT NULL,
    fichier_devis_url character varying(255)
);


ALTER TABLE public.demandes_devis OWNER TO postgres;

--
-- Name: demandes_produits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demandes_produits (
    id uuid NOT NULL,
    client_id uuid NOT NULL,
    nom_produit character varying(180) NOT NULL,
    description text,
    quantite_souhaitee numeric(14,3),
    categorie character varying(100),
    photo_url character varying(255),
    commentaire text,
    statut public.enum_demandes_produits_statut DEFAULT 'PENDING'::public.enum_demandes_produits_statut NOT NULL,
    reponse_admin text,
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.demandes_produits OWNER TO postgres;

--
-- Name: demandes_vehicules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demandes_vehicules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid,
    utilisateur_id uuid,
    nom_vehicule character varying(180) NOT NULL,
    description text,
    nom character varying(180) NOT NULL,
    telephone character varying(32) NOT NULL,
    email character varying(254) NOT NULL,
    statut character varying(20) DEFAULT 'PENDING'::character varying,
    reponse_admin text,
    cree_le timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    mis_a_jour_le timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT demandes_vehicules_statut_check CHECK (((statut)::text = ANY ((ARRAY['PENDING'::character varying, 'CONTACTED'::character varying, 'CONVERTED'::character varying, 'REJECTED'::character varying])::text[])))
);


ALTER TABLE public.demandes_vehicules OWNER TO postgres;

--
-- Name: devis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.devis (
    id uuid NOT NULL,
    client_id uuid NOT NULL,
    numero character varying(40) NOT NULL,
    statut public.enum_devis_statut DEFAULT 'ISSUED'::public.enum_devis_statut NOT NULL,
    montant_total numeric(14,2) NOT NULL,
    valide_jusqu_au date NOT NULL,
    chemin_pdf character varying(255),
    conditions text,
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.devis OWNER TO postgres;

--
-- Name: entreprises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entreprises (
    id uuid NOT NULL,
    client_id uuid NOT NULL,
    nom character varying(180) NOT NULL,
    nom_responsable character varying(180),
    numero_identification character varying(100),
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.entreprises OWNER TO postgres;

--
-- Name: mouvements_stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mouvements_stock (
    id uuid NOT NULL,
    produit_id uuid NOT NULL,
    cree_par_utilisateur_id uuid,
    type public.enum_mouvements_stock_type NOT NULL,
    quantite numeric(14,3) NOT NULL,
    motif character varying(255),
    reference character varying(100),
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.mouvements_stock OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    utilisateur_destinataire_id uuid,
    type character varying(80) NOT NULL,
    titre character varying(180) NOT NULL,
    message text NOT NULL,
    lien character varying(255),
    est_lu boolean DEFAULT false NOT NULL,
    lu_le timestamp with time zone,
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: paniers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paniers (
    id uuid NOT NULL,
    client_id uuid NOT NULL,
    statut public.enum_paniers_statut DEFAULT 'ACTIVE'::public.enum_paniers_statut NOT NULL,
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.paniers OWNER TO postgres;

--
-- Name: parametres; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parametres (
    id uuid NOT NULL,
    cle character varying(100) NOT NULL,
    valeur jsonb NOT NULL,
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.parametres OWNER TO postgres;

--
-- Name: produits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.produits (
    id uuid NOT NULL,
    categorie_id uuid,
    nom character varying(180) NOT NULL,
    reference character varying(100) NOT NULL,
    description text,
    image_url character varying(255),
    unite character varying(40) DEFAULT 'unité'::character varying NOT NULL,
    stock numeric(14,3) DEFAULT 0 NOT NULL,
    seuil_alerte numeric(14,3) DEFAULT 0 NOT NULL,
    statut public.enum_produits_statut DEFAULT 'ACTIVE'::public.enum_produits_statut NOT NULL,
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.produits OWNER TO postgres;

--
-- Name: promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotions (
    id uuid NOT NULL,
    produit_id uuid,
    vehicule_id uuid,
    titre character varying(180) NOT NULL,
    description text,
    image_url character varying(255),
    prix_normal numeric(14,2),
    prix_promotionnel numeric(14,2) NOT NULL,
    commence_le timestamp with time zone NOT NULL,
    termine_le timestamp with time zone NOT NULL,
    statut public.enum_promotions_statut DEFAULT 'DRAFT'::public.enum_promotions_statut NOT NULL,
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT promotions_single_target CHECK ((((produit_id IS NOT NULL) AND (vehicule_id IS NULL)) OR ((produit_id IS NULL) AND (vehicule_id IS NOT NULL))))
);


ALTER TABLE public.promotions OWNER TO postgres;

--
-- Name: reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservations (
    id uuid NOT NULL,
    client_id uuid NOT NULL,
    vehicule_id uuid NOT NULL,
    reference character varying(40) NOT NULL,
    commence_le timestamp with time zone NOT NULL,
    termine_le timestamp with time zone NOT NULL,
    statut public.enum_reservations_statut DEFAULT 'PENDING'::public.enum_reservations_statut NOT NULL,
    prix_journalier numeric(14,2) NOT NULL,
    montant_total numeric(14,2) NOT NULL,
    avec_chauffeur boolean DEFAULT false NOT NULL,
    expire_le timestamp with time zone NOT NULL,
    note_gestionnaire text,
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.reservations OWNER TO postgres;

--
-- Name: tarifs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tarifs (
    id uuid NOT NULL,
    produit_id uuid NOT NULL,
    type_client public.enum_tarifs_type_client NOT NULL,
    prix numeric(14,2) NOT NULL,
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    entreprise_id uuid
);


ALTER TABLE public.tarifs OWNER TO postgres;

--
-- Name: utilisateurs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utilisateurs (
    id uuid NOT NULL,
    email character varying(254) NOT NULL,
    telephone character varying(32),
    mot_de_passe_hash character varying(255) NOT NULL,
    role public.enum_utilisateurs_role DEFAULT 'CLIENT'::public.enum_utilisateurs_role NOT NULL,
    est_actif boolean DEFAULT true NOT NULL,
    derniere_connexion_au timestamp with time zone,
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    avatar_url character varying(255)
);


ALTER TABLE public.utilisateurs OWNER TO postgres;

--
-- Name: vehicule_prix_entreprises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicule_prix_entreprises (
    id uuid NOT NULL,
    vehicule_id uuid NOT NULL,
    entreprise_id uuid NOT NULL,
    prix_journalier numeric(14,2) NOT NULL,
    cree_le timestamp with time zone DEFAULT now() NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.vehicule_prix_entreprises OWNER TO postgres;

--
-- Name: vehicules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicules (
    id uuid NOT NULL,
    marque character varying(100) NOT NULL,
    modele character varying(100) NOT NULL,
    categorie character varying(100) NOT NULL,
    description text,
    image_url character varying(255),
    places integer NOT NULL,
    carburant character varying(60),
    transmission character varying(60),
    prix_journalier_particulier numeric(14,2) NOT NULL,
    prix_journalier_entreprise numeric(14,2) NOT NULL,
    disponibilite boolean DEFAULT true NOT NULL,
    statut public.enum_vehicules_statut DEFAULT 'ACTIVE'::public.enum_vehicules_statut NOT NULL,
    cree_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    prix_journalier_entreprise_client numeric(14,2)
);


ALTER TABLE public.vehicules OWNER TO postgres;

--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SequelizeMeta" (name) FROM stdin;
20260812000100-initialize-commercial-platform.cjs
20260812000200-create-quote-requests.cjs
20260813000100-create-vehicle-requests.cjs
20260815000100-make-company-responsible-optional.cjs
20260815000200-create-settings.cjs
20260815000300-add-avatar-url-to-users.cjs
20260817000100-add-entreprise-client-type.cjs
20260817000200-add-entreprise-client-vehicle-price.cjs
20260820000100-add-company-specific-pricing.cjs
\.


--
-- Data for Name: articles_devis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articles_devis (id, devis_id, produit_id, libelle, quantite, prix_unitaire, prix_total, cree_le, mis_a_jour_le) FROM stdin;
\.


--
-- Data for Name: articles_panier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articles_panier (id, panier_id, produit_id, vehicule_id, quantite, prix_unitaire, commence_le, termine_le, cree_le, mis_a_jour_le) FROM stdin;
ac4f65cd-2035-479e-a234-36e6a925a70a	5006fb68-c0e8-4c11-b2e7-d97a15391224	ec3d252c-37ac-46e0-baaa-c18b34989eb8	\N	1.000	42000.00	\N	\N	2026-08-20 16:49:16.137+00	2026-08-20 16:49:37.166+00
2cacf15d-d2e4-4fb5-892f-3750f5acf09e	5006fb68-c0e8-4c11-b2e7-d97a15391224	93b3184d-914c-410f-ba8e-db4c4bcf5338	\N	1.000	6000.00	\N	\N	2026-08-20 16:49:44.135+00	2026-08-20 16:49:44.135+00
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, nom, slug, description, parent_id, est_actif, cree_le, mis_a_jour_le) FROM stdin;
cde27e41-2faf-4295-9b05-bea01050efc5	Plomberie	plomberie	Tuyaux, raccords et accessoires.	\N	t	2026-08-13 08:40:19.441+00	2026-08-13 08:40:19.441+00
6c6e8ecb-bae8-4419-9485-b7b5df85cd6b	Matériaux	materiaux	Matériaux et fournitures de chantier.	\N	t	2026-08-13 08:40:19.554+00	2026-08-13 08:40:19.554+00
b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33	Quincaillerie	quincaillerie	Vis, boulons, clous, charnieres, serrures et accessoires.	\N	t	2026-08-17 09:36:03.77+00	2026-08-17 09:36:03.77+00
0a493024-eee9-4166-9d39-35e40f502b4d	Cables & Electricite	cables-electricite	Cables H200, fils electriques, disjoncteurs et accessoires.	\N	t	2026-08-17 09:36:04.366+00	2026-08-17 09:36:04.366+00
fb9a9898-0e06-4a0f-950e-e13bca63020d	Groupes Electrogenes	groupes-electrogenes	Groupes electrogenes essence et diesel.	\N	t	2026-08-17 09:36:04.842+00	2026-08-17 09:36:04.842+00
069c5baf-3e8b-4f6a-a8f5-c391bc83fd2d	Peinture & Finition	peinture-finition	Peintures, enduits et accessoires.	\N	t	2026-08-17 09:36:05.313+00	2026-08-17 09:36:05.313+00
55c7dd48-b498-49e2-8735-82885876ff36	Materiaux de Construction	materiaux-construction	Ciment, fer, sable, gravier et materiaux.	\N	t	2026-08-17 09:36:05.474+00	2026-08-17 09:36:05.474+00
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, utilisateur_id, type_client, prenom, nom, adresse, cree_le, mis_a_jour_le, delai_blocage_jours, bloque_le) FROM stdin;
2c91e316-d2dc-4202-abf0-76e01df601d4	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	PARTICULIER	Client	Soutarah	Abidjan, Côte d’Ivoire	2026-08-13 08:40:10.441+00	2026-08-13 08:40:10.441+00	\N	\N
fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	PARTICULIER	David	Sorho	cocody, snk	2026-08-13 13:45:39.627+00	2026-08-13 13:45:39.627+00	\N	\N
2162822c-f3ae-42ea-a2d8-715b9eb4fda4	44772e8b-0513-4046-b94a-dd60d14b7c89	ENTREPRISE_CLIENT	\N	\N	abidjan	2026-08-18 10:02:06.028+00	2026-08-18 10:02:06.028+00	\N	\N
\.


--
-- Data for Name: demandes_devis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demandes_devis (id, reference, client_id, utilisateur_id, source, service, titre, budget, delai, description, entreprise, nom, email, telephone, lieu, statut, cree_le, mis_a_jour_le, fichier_devis_url) FROM stdin;
9116912b-1504-479d-8973-bed4dec8d1ec	DMD-2026-5382	2c91e316-d2dc-4202-abf0-76e01df601d4	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	Client Soutarah	client@soutarah.local	0700000001	Abidjan, Côte d’Ivoire	PENDING	2026-08-13 09:55:10.714+00	2026-08-13 09:55:10.714+00	\N
8bf00a9b-5004-4d42-aab4-3f1aabdeb77a	DMD-2026-4958	2c91e316-d2dc-4202-abf0-76e01df601d4	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (15j)	\N	Client Soutarah	client@soutarah.local	0700000001	Abidjan, Côte d’Ivoire	PENDING	2026-08-13 10:05:43.009+00	2026-08-13 10:05:43.009+00	\N
b9a54caa-fc22-4526-9f8c-81d6c7a76209	DMD-2026-8956	2c91e316-d2dc-4202-abf0-76e01df601d4	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	Client Soutarah	client@soutarah.local	0700000001	Abidjan, Côte d’Ivoire	PENDING	2026-08-13 12:11:10.334+00	2026-08-13 12:11:10.334+00	\N
1cc3e3eb-cc34-4717-98e4-5a08e9d40e97	DMD-2026-2745	2c91e316-d2dc-4202-abf0-76e01df601d4	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	Client Soutarah	client@soutarah.local	0700000001	Abidjan, Côte d’Ivoire	PENDING	2026-08-13 12:16:59.843+00	2026-08-13 12:16:59.843+00	\N
c9a7c8de-e2ce-4de4-92bf-8f72b84885ee	DMD-2026-2051	2c91e316-d2dc-4202-abf0-76e01df601d4	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	Client Soutarah	client@soutarah.local	0700000001	Abidjan, Côte d’Ivoire	PENDING	2026-08-13 12:20:12.318+00	2026-08-13 12:20:12.318+00	\N
6e42dfb4-f1d8-464c-8a53-45399e1fa3ac	DMD-2026-7119	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	PENDING	2026-08-13 13:49:53.431+00	2026-08-13 13:49:53.431+00	\N
3be919e2-2ece-4419-b7b9-64102c7d514e	DMD-2026-8429	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	PENDING	2026-08-13 16:34:56.933+00	2026-08-13 16:34:56.933+00	\N
b44c699b-2524-4cb6-8136-f3d44c639851	DMD-2026-2761	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (9j)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	PENDING	2026-08-13 17:03:24.264+00	2026-08-13 17:03:24.264+00	\N
c323ec37-009a-465d-849e-8e1ccb7329ef	DMD-2026-3812	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	PENDING	2026-08-14 09:47:54.796+00	2026-08-14 09:47:54.796+00	\N
9f0b36d7-d9af-4d0d-8a76-902bf9c70c3f	DMD-2026-2895	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	PENDING	2026-08-14 09:56:22.629+00	2026-08-14 09:56:22.629+00	\N
6df39be6-03a2-454b-ad16-3774c51933a0	DMD-2026-6143	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	APPROVED	2026-08-14 10:02:06.73+00	2026-08-14 16:38:57.623+00	/uploads/quotes/devis-DMD-2026-6143-signed.pdf
9998466d-03e2-4b4a-8256-22e8a48d8dd4	DMD-2026-4513	2c91e316-d2dc-4202-abf0-76e01df601d4	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	Client Soutarah	client@soutarah.local	0700000001	Abidjan, Côte d’Ivoire	PENDING	2026-08-17 11:36:14.409+00	2026-08-17 11:36:14.409+00	\N
5d295850-8f8b-4d1e-83d7-02e498b00b1b	DMD-2026-8602	2c91e316-d2dc-4202-abf0-76e01df601d4	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Article (xNaN) | Location Véhicule (1j) | Location Véhicule (1j) | Location Véhicule (1j)	\N	Client Soutarah	client@soutarah.local	0700000001	Abidjan, Côte d’Ivoire	PENDING	2026-08-17 15:58:06.808+00	2026-08-17 15:58:06.808+00	\N
e32e1b14-04e6-4355-b587-c2fe3982e0c4	DMD-2026-9544	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	PENDING	2026-08-18 11:45:47.12+00	2026-08-18 11:45:47.12+00	\N
e411d64e-4661-4550-88cb-62885859d98d	DMD-2026-8158	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	APPROVED	2026-08-17 08:25:05.564+00	2026-08-18 09:42:45.221+00	\N
afb6cb84-6ec2-45e3-bef2-ff9756dae765	DMD-2026-5573	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	PENDING	2026-08-18 11:53:07.694+00	2026-08-18 11:53:07.694+00	\N
ab29ac20-d13c-4360-a007-12fbf2ee62aa	DMD-2026-4580	2c91e316-d2dc-4202-abf0-76e01df601d4	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Article (xNaN) | Location Véhicule (1j) | Location Véhicule (1j) | Location Véhicule (1j)	\N	Client Soutarah	client@soutarah.local	0700000001	Abidjan, Côte d’Ivoire	SENT	2026-08-17 15:58:08.927+00	2026-08-18 10:46:58.594+00	/uploads/quotes/devis-DMD-2026-4580-signed.pdf
cb1bb742-bd2e-49e4-ae7f-a85cc8d1541a	DMD-2026-7628	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Article (xNaN)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	PENDING	2026-08-18 11:44:32.903+00	2026-08-18 11:44:32.903+00	\N
a9bebcd3-1001-4f0e-9042-bdd5992381b0	DMD-2026-3210	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	SENT	2026-08-18 14:34:14.995+00	2026-08-19 08:55:17.515+00	/uploads/quotes/devis-DMD-2026-3210-signed.pdf
f8f5af1d-476e-48b5-a04e-045d338fd906	DMD-2026-4352	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j) | Location Véhicule (1j)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	SENT	2026-08-18 14:25:21.171+00	2026-08-19 09:43:38.98+00	/uploads/quotes/devis-DMD-2026-4352-signed.pdf
a4acbdc9-a355-47d4-85dd-c8bed1e5a0f0	DMD-2026-2686	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	SENT	2026-08-18 13:07:23.988+00	2026-08-19 09:46:47.825+00	/uploads/quotes/devis-DMD-2026-2686-signed.pdf
9d963e73-790e-4e40-a51b-4165b8545800	DMD-2026-8113	2c91e316-d2dc-4202-abf0-76e01df601d4	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Article (xNaN) | Article (xNaN) | Article (xNaN) | Article (xNaN) | Location Véhicule (1j) | Location Véhicule (1j) | Location Véhicule (1j) | Location Véhicule (1j) | Location Véhicule (1j)	\N	Client Soutarah	client@soutarah.local	0700000001	Abidjan, Côte d’Ivoire	APPROVED	2026-08-17 11:13:54.877+00	2026-08-19 09:47:03.634+00	/uploads/quotes/devis-DMD-2026-8113-signed.pdf
bbad609a-716b-498d-9730-8b4a637273f9	DMD-2026-7797	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Article (xNaN) | Location Véhicule (1j) | Location Véhicule (1j) | Location Véhicule (1j)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	PENDING	2026-08-19 14:55:38.835+00	2026-08-19 14:55:38.835+00	\N
f0708c81-5e31-4988-b0b1-2235dc9798e2	DMD-2026-8689	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	SENT	2026-08-19 16:19:41.531+00	2026-08-19 16:49:26.653+00	/uploads/quotes/devis-DMD-2026-8689-signed.pdf
742adb5c-5643-4a37-aebd-b6ae662cc7b2	DMD-2026-7029	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Article (xNaN)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	PENDING	2026-08-21 11:34:50.156+00	2026-08-21 11:34:50.156+00	\N
6ce0c54b-df7b-4d10-8eee-72b64ce8f9ce	DMD-2026-5556	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Devis Panier SOUTARAH	Demande de devis (DMD-2026-9913)	165000	\N	1x Audi A6	\N	David Sorho	sorhodavid31@gmail.com	0584278638	Abidjan	PENDING	2026-08-22 10:09:46.973+00	2026-08-22 10:09:46.973+00	\N
58a8b7e5-29db-4c71-815a-2e050569172f	DMD-2026-9640	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Devis Panier SOUTARAH	Demande de devis (DMD-2026-5886)	165000	\N	1x Audi A6	\N	David Sorho	sorhodavid31@gmail.com	0584278638	Abidjan	PENDING	2026-08-22 10:20:56.743+00	2026-08-22 10:20:56.743+00	\N
18dcaede-6d8c-4f27-829e-8e7a106ddf88	DMD-2026-4639	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Devis Panier SOUTARAH	Demande de devis (DMD-2026-6757)	330000	\N	1x Audi A6, 1x Audi A6	\N	David Sorho	sorhodavid31@gmail.com	0584278638	Abidjan	PENDING	2026-08-22 10:54:02.521+00	2026-08-22 10:54:02.521+00	\N
f6cb0077-98aa-4262-9865-2b7195b3b0b4	DMD-2026-2683	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Ajout au panier	Ajout au panier: Hyundai H350	100000	\N	Un client a ajouté le véhicule Hyundai H350 (1 jours) à son panier.	\N	sorhodavid31	sorhodavid31@gmail.com	0584278638	Abidjan	SENT	2026-08-22 11:27:35.086+00	2026-08-22 11:30:34.102+00	\N
9441a272-26cb-4fbb-820f-ed755c704e26	DMD-2026-2814	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	PENDING	2026-08-23 18:00:55.467+00	2026-08-23 18:00:55.467+00	\N
ea4af1cb-b5e0-4665-be0d-78d1fdf63aaa	DMD-2026-2539	fa515ab8-40ff-44d6-b1ab-94ee851a8290	5f1f291d-0fad-494b-bffb-9af5b9e14732	CLIENT	Négoce et Location	Devis Panier SOUTARAH	\N	\N	Location Véhicule (1j)	\N	David Sorho	sorhodavid31@gmail.com	0584278638	cocody, snk	PENDING	2026-08-23 18:02:38.171+00	2026-08-23 18:02:38.171+00	\N
\.


--
-- Data for Name: demandes_produits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demandes_produits (id, client_id, nom_produit, description, quantite_souhaitee, categorie, photo_url, commentaire, statut, reponse_admin, cree_le, mis_a_jour_le) FROM stdin;
\.


--
-- Data for Name: demandes_vehicules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demandes_vehicules (id, client_id, utilisateur_id, nom_vehicule, description, nom, telephone, email, statut, reponse_admin, cree_le, mis_a_jour_le) FROM stdin;
bb2d04e2-43a1-4c3c-b3c9-3b47fecef7bc	\N	\N	Toyota Land Cruiser V8	Besoin urgent pour un déplacement à l'intérieur du pays, 7 jours	Test Client	0700000099	test@example.com	PENDING	\N	2026-08-14 08:12:24.925	2026-08-14 08:12:24.925
28477f57-75fd-44e8-b1dc-102bdc2f3a62	\N	\N	toyota	\N	David Sorho	0584278638	sorhodavid31@gmail.com	PENDING	\N	2026-08-14 08:14:59.615	2026-08-14 08:14:59.615
42c8638a-79ee-4c88-8b07-93a0fd840325	\N	\N	Mercedes G-Class	Pour un mariage le mois prochain	Jean Kouassi	0707070707	jean@test.com	PENDING	\N	2026-08-14 08:19:50.768	2026-08-14 08:19:50.768
3365f4ef-5fa0-4dc7-b839-d59917606bdf	\N	\N	Toyota Land Cruiser V8	Besoin urgent pour un déplacement à l'intérieur du pays, 7 jours	Test Client	0700000099	test@example.com	PENDING	\N	2026-08-14 08:20:02.417	2026-08-14 08:20:02.417
\.


--
-- Data for Name: devis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.devis (id, client_id, numero, statut, montant_total, valide_jusqu_au, chemin_pdf, conditions, cree_le, mis_a_jour_le) FROM stdin;
\.


--
-- Data for Name: entreprises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entreprises (id, client_id, nom, nom_responsable, numero_identification, cree_le, mis_a_jour_le) FROM stdin;
9bd38c2f-9671-40ae-b210-07a4f12a288e	2162822c-f3ae-42ea-a2d8-715b9eb4fda4	sucaf	\N	\N	2026-08-18 10:02:06.033+00	2026-08-18 10:02:06.033+00
\.


--
-- Data for Name: mouvements_stock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mouvements_stock (id, produit_id, cree_par_utilisateur_id, type, quantite, motif, reference, cree_le, mis_a_jour_le) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, utilisateur_destinataire_id, type, titre, message, lien, est_lu, lu_le, cree_le, mis_a_jour_le) FROM stdin;
492c2e09-6b98-4040-90b5-3eb85661585a	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-5382 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	\N	t	\N	2026-08-13 09:55:10.737+00	2026-08-13 10:04:06.515+00
5f55b2ac-d296-452a-a35f-50c8744f974b	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-4958 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	\N	t	\N	2026-08-13 10:05:43.019+00	2026-08-13 10:06:25.185+00
3444fd29-c26c-49a3-b77e-b74a50bd72ea	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-8956 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	\N	t	\N	2026-08-13 12:11:10.372+00	2026-08-13 12:11:41.461+00
07e1462c-55af-4319-8da3-3560e72c7e6e	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-2745 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	\N	f	\N	2026-08-13 12:16:59.862+00	2026-08-13 12:16:59.862+00
f832ae4e-d179-4871-a9dc-dc79e9f4ad8c	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-2051 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	\N	t	\N	2026-08-13 12:20:12.33+00	2026-08-13 13:43:51.362+00
a0cd3e72-225f-4061-83fb-514aaa809bb3	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-2761 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	\N	t	\N	2026-08-13 17:03:24.284+00	2026-08-14 07:53:54.204+00
2525d59b-cb8b-4f2f-9fb3-f87e0aad29a4	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	Client Soutarah a envoyé une demande de devis : Devis Panier SOUTARAH.	\N	t	\N	2026-08-13 12:11:10.366+00	2026-08-14 08:24:29.586+00
4c332099-1d5a-4e5c-a55d-cd520cd20431	\N	VEHICLE_REQUEST	🚗 Nouvelle demande de véhicule	Un client a demandé un devis pour un Toyota Hilux.	\N	f	\N	2026-08-14 09:33:02.944+00	2026-08-14 09:33:02.944+00
485b1b7c-be72-4f38-bdcf-fe9aed696d7b	\N	CART_ITEM_ADDED	🛒 Nouvel ajout au panier	Un client a ajouté 50 sacs de ciment Portland au panier.	\N	f	\N	2026-08-14 09:33:02.959+00	2026-08-14 09:33:02.959+00
6f4cf3ce-1d10-4cf5-82d1-3f1650922c33	\N	QUOTE_REQUEST	📋 Nouvelle demande de devis	Entreprise SARL BTP a demandé un devis pour 100 tonnes de fer à béton.	\N	f	\N	2026-08-14 09:33:02.961+00	2026-08-14 09:33:02.961+00
be966b52-5d7b-4b42-9968-30267a605bd5	\N	NEW_CLIENT	👤 Nouveau client entreprise	SARL Construction Plus s'est inscrit en tant que client entreprise.	\N	f	\N	2026-08-14 09:33:02.963+00	2026-08-14 09:33:02.963+00
629c17ff-589e-4a39-b385-a8d816f8b231	\N	NEW_ORDER	🚚 Réservation urgente	Réservation de camion benne pour demain matin à 7h.	\N	f	\N	2026-08-14 09:33:02.964+00	2026-08-14 09:33:02.964+00
9007a477-04f2-442b-8501-a06410eaee4a	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	\N	t	\N	2026-08-14 09:56:22.642+00	2026-08-14 09:56:58.591+00
60c52de7-dbef-427a-a617-e870b2a26159	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	\N	t	\N	2026-08-14 09:47:54.805+00	2026-08-14 09:57:09.241+00
6d94766a-280c-431c-91ff-63ad27851731	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	\N	t	\N	2026-08-14 10:02:06.746+00	2026-08-14 10:05:04.482+00
f1f30b1e-6f82-4fcb-93fb-786dedc84973	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	Client Soutarah a envoyé une demande de devis : Devis Panier SOUTARAH.	\N	t	\N	2026-08-13 12:16:59.856+00	2026-08-14 16:05:26.262+00
e08251cf-85d1-4d9a-a8c2-7e6511c0b466	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	Client Soutarah a envoyé une demande de devis : Devis Panier SOUTARAH.	\N	t	\N	2026-08-13 12:20:12.326+00	2026-08-14 16:05:28.508+00
36f35fe0-a4f4-4cf5-8114-28d295310ad8	5f1f291d-0fad-494b-bffb-9af5b9e14732	QUOTE_APPROVED	Devis approuvé !	Votre devis DMD-2026-6143 a été approuvé par l'administrateur. Vous pouvez le consulter dans votre espace.	/mes-devis	t	\N	2026-08-14 16:36:12.72+00	2026-08-14 16:41:03.457+00
1be01b4b-74be-4786-9f31-b10af5f22640	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-6143 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	\N	t	\N	2026-08-14 10:02:06.75+00	2026-08-14 17:16:06.679+00
a9e4608c-3455-44bc-92d9-771c00d69eb2	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-3812 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	\N	t	\N	2026-08-14 09:47:54.809+00	2026-08-14 17:16:14.081+00
0819029e-0a0d-48f1-8051-1eb556fc5820	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-2895 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	\N	t	\N	2026-08-14 09:56:22.644+00	2026-08-14 17:16:15.018+00
33a24e4c-9cb0-487a-af00-428c35b6dc93	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-7119 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	\N	t	\N	2026-08-13 13:49:53.45+00	2026-08-14 17:16:17.149+00
af61f887-205f-465f-811f-d7e73affae83	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-8429 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	\N	t	\N	2026-08-13 16:34:56.955+00	2026-08-14 17:16:17.848+00
160a58b2-275b-4c70-824c-11d7b49809c8	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	dada test a envoyé une demande de devis : Devis Panier SOUTARAH.	\N	t	2026-08-17 07:58:06.454+00	2026-08-15 15:41:36.399+00	2026-08-17 07:58:06.457+00
067e001f-e0b2-4e43-89e7-6f891c5a51f0	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	VEHICLE_REQUEST	Nouvelle demande de véhicule	Test Client recherche: Toyota Land Cruiser V8. Contact: 0700000099 / test@example.com	/admin/vehicle-requests	t	2026-08-17 07:58:16.782+00	2026-08-14 08:20:02.459+00	2026-08-17 07:58:16.782+00
43fdd358-c33b-419b-b1b3-e9764dfe650d	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	VEHICLE_REQUEST	Nouvelle demande de véhicule	Jean Kouassi recherche: Mercedes G-Class. Contact: 0707070707 / jean@test.com	/admin/vehicle-requests	t	2026-08-17 07:58:26.92+00	2026-08-14 08:19:50.821+00	2026-08-17 07:58:26.921+00
f8db9a5c-a3d8-4266-99d8-2f5c179c0907	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	VEHICLE_REQUEST	Nouvelle demande de véhicule	Test Client recherche: Toyota Land Cruiser V8. Contact: 0700000099 / test@example.com	/admin/vehicle-requests	t	2026-08-17 07:58:33.984+00	2026-08-14 08:12:25.04+00	2026-08-17 07:58:33.984+00
024865c6-21eb-46fd-9e2d-9bb353449e93	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	VEHICLE_REQUEST	Nouvelle demande de véhicule	David Sorho recherche: toyota. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/vehicle-requests	t	2026-08-17 07:58:34.766+00	2026-08-14 08:14:59.714+00	2026-08-17 07:58:34.766+00
b2988339-e27c-475d-afc1-9348d8c3fc82	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	\N	t	2026-08-17 08:00:58.698+00	2026-08-13 16:34:56.95+00	2026-08-17 08:00:58.698+00
fe9992de-d8dd-49aa-a986-3e29851ecc56	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	\N	t	2026-08-17 08:01:00+00	2026-08-13 17:03:24.279+00	2026-08-17 08:01:00+00
b48df38c-8321-46ab-a9d9-5419e00ec5eb	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	Client Soutarah a envoyé une demande de devis : Devis Panier SOUTARAH.	\N	t	2026-08-17 08:23:15.276+00	2026-08-13 10:05:43.015+00	2026-08-17 08:23:15.278+00
e4b5845f-4928-46f4-967e-1eb204ba465e	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	Client Soutarah a envoyé une demande de devis : Devis Panier SOUTARAH.	\N	t	2026-08-17 08:23:20.813+00	2026-08-13 09:55:10.731+00	2026-08-17 08:23:20.813+00
9d5535dd-664c-428f-85f6-74784f772ac0	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	\N	t	2026-08-17 08:23:28.912+00	2026-08-13 13:49:53.447+00	2026-08-17 08:23:28.912+00
f64e1b71-5ce7-4827-900d-cb882ec372ce	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-8158 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	\N	f	\N	2026-08-17 08:25:05.584+00	2026-08-17 08:25:05.584+00
7f360cb0-fa3c-4871-9b08-89ea4abf889c	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	\N	t	2026-08-17 08:49:30.646+00	2026-08-17 08:25:05.581+00	2026-08-17 08:49:30.649+00
28a7de2e-1e5f-449e-9930-abaa6853fbb3	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Article ajouté au panier	David Sorho a ajouté "Tuyau PVC Ø50" (x1) à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	f	\N	2026-08-17 09:34:32.84+00	2026-08-17 09:34:32.84+00
e21190b9-071a-4abf-8b2f-69cd173989eb	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Article ajouté au panier	Client Soutarah a ajouté "Peinture glycerophtalique 5L" (x1) à son panier. Contact: 0700000001 / client@soutarah.local	/admin/clients	f	\N	2026-08-17 10:21:10.803+00	2026-08-17 10:21:10.803+00
cc0adfc9-ab81-4fde-9f32-481de8899531	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Panier mis à jour	Client Soutarah a modifié la quantité de "Peinture glycerophtalique 5L" (maintenant x2). Contact: 0700000001 / client@soutarah.local	/admin/clients	f	\N	2026-08-17 10:21:10.961+00	2026-08-17 10:21:10.961+00
7c140cb2-ddd4-42fe-b4f3-3e9bdf192d9d	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Article ajouté au panier	Client Soutarah a ajouté "Vis a bois galvanisees 4x40 (boite de 100)" (x1) à son panier. Contact: 0700000001 / client@soutarah.local	/admin/clients	f	\N	2026-08-17 10:28:53.306+00	2026-08-17 10:28:53.306+00
2d0ed9cd-58c9-4f72-a6ab-018b70dae888	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Article ajouté au panier	Client Soutarah a ajouté "Tuyau PVC Ø50" (x1) à son panier. Contact: 0700000001 / client@soutarah.local	/admin/clients	f	\N	2026-08-17 10:28:55.878+00	2026-08-17 10:28:55.878+00
b19cd4ea-2fcc-47da-bf1e-a149aae03863	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Article ajouté au panier	Client Soutarah a ajouté "Cable H200 2x1.5mm2 (rouleau 100m)" (x1) à son panier. Contact: 0700000001 / client@soutarah.local	/admin/clients	f	\N	2026-08-17 10:53:31.166+00	2026-08-17 10:53:31.166+00
cf6e9dfe-f9e6-431e-ac6a-7171ce2958e4	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Article ajouté au panier	David Sorho a ajouté "Cable H200 2x2.5mm2 (rouleau 100m)" (x1) à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	f	\N	2026-08-17 11:02:39.762+00	2026-08-17 11:02:39.762+00
afdd5d36-81bd-4a5f-848d-517bdabc1273	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	Client Soutarah a envoyé une demande de devis : Devis Panier SOUTARAH.	/admin/quotes	f	\N	2026-08-17 11:13:54.883+00	2026-08-17 11:13:54.883+00
7e5ce756-8b57-4ed0-949d-e7d694c23570	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-8113 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-17 11:13:54.885+00	2026-08-17 11:13:54.885+00
36db6ff1-8cce-40c8-8339-a1b2f6947682	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	Client Soutarah a ajouté la location "Renault OROCH" du 2026-08-17 au 2026-08-18 (1 jour) sans chauffeur à son panier. Contact: 0700000001 / client@soutarah.local	/admin/clients	t	2026-08-17 11:35:25.881+00	2026-08-17 11:34:54.503+00	2026-08-17 11:35:25.881+00
52d2c27f-430d-41e1-9ab3-c7aa43a03a4c	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	Client Soutarah a envoyé une demande de devis : Devis Panier SOUTARAH.	/admin/quotes	f	\N	2026-08-17 11:36:14.421+00	2026-08-17 11:36:14.421+00
b2de3754-ba6d-4fa9-993f-03c91b86b33c	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-4513 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-17 11:36:14.424+00	2026-08-17 11:36:14.424+00
3d4ece6a-07ac-493c-8a27-4034b5ad3957	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	Client Soutarah a ajouté la location "Renault OROCH" du 2026-08-17 au 2026-08-18 (1 jour) sans chauffeur à son panier. Contact: 0700000001 / client@soutarah.local	/admin/clients	f	\N	2026-08-17 12:57:22.477+00	2026-08-17 12:57:22.477+00
12a0eb74-f429-4bd2-9f27-abc9cb90cd39	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	Client Soutarah a ajouté la location "Renault OROCH" du 2026-08-17 au 2026-08-18 (1 jour) sans chauffeur à son panier. Contact: 0700000001 / client@soutarah.local	/admin/clients	f	\N	2026-08-17 14:00:30.417+00	2026-08-17 14:00:30.417+00
9a3950a1-a614-4559-ac1a-03ea93d8e06c	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Article ajouté au panier	Client Soutarah a ajouté "Cable H200 2x2.5mm2 (rouleau 100m)" (x1) à son panier. Contact: 0700000001 / client@soutarah.local	/admin/clients	f	\N	2026-08-17 14:00:36.98+00	2026-08-17 14:00:36.98+00
3fcc8e98-09a2-46bd-9cd5-d31d7e03edb1	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	Client Soutarah a ajouté la location "Renault Duster" du 2026-08-17 au 2026-08-18 (1 jour) sans chauffeur à son panier. Contact: 0700000001 / client@soutarah.local	/admin/clients	f	\N	2026-08-17 15:57:56.815+00	2026-08-17 15:57:56.815+00
c0d6db2f-ae6a-4c01-9b26-9f1801439449	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-8602 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-17 15:58:06.816+00	2026-08-17 15:58:06.816+00
57c0975c-b155-4a2a-b05a-26e0c86ef655	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	Client Soutarah a envoyé une demande de devis : Devis Panier SOUTARAH.	/admin/quotes	f	\N	2026-08-17 15:58:08.93+00	2026-08-17 15:58:08.93+00
c18668c5-0c32-4ebb-8e78-17750d2c89d4	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-4580 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-17 15:58:08.931+00	2026-08-17 15:58:08.931+00
547b2817-7d8a-4d8b-9a4b-57412044ea5a	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	Client Soutarah a envoyé une demande de devis : Devis Panier SOUTARAH.	/admin/quotes	t	2026-08-18 09:40:12.54+00	2026-08-17 15:58:06.813+00	2026-08-18 09:40:12.543+00
c6508778-910f-4104-b19d-4f9af187d3d4	5f1f291d-0fad-494b-bffb-9af5b9e14732	QUOTE_APPROVED	Devis approuvé !	Votre devis DMD-2026-8158 a été approuvé par l'administrateur. Vous pouvez le consulter dans votre espace.	/mes-devis	f	\N	2026-08-18 09:42:45.42+00	2026-08-18 09:42:45.42+00
fd421e5a-85fe-4634-96be-77e218094824	5f1f291d-0fad-494b-bffb-9af5b9e14732	QUOTE_APPROVED	Devis approuvé !	Votre devis DMD-2026-8158 a été approuvé par l'administrateur. Vous pouvez le consulter dans votre espace.	/mes-devis	f	\N	2026-08-18 09:42:53.113+00	2026-08-18 09:42:53.113+00
f7aeeaa3-0b34-4f10-8dcc-b2cfbdf07c99	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	QUOTE_APPROVED	Devis approuvé !	Votre devis DMD-2026-4580 a été approuvé par l'administrateur. Vous pouvez le consulter dans votre espace.	/mes-devis	f	\N	2026-08-18 09:43:07.057+00	2026-08-18 09:43:07.057+00
1440b397-7f7d-469d-825b-0a0a332c8849	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	sucaf@gmail.com a ajouté la location "Mitsubishi Pajero 13" du 2026-08-18 au 2026-08-19 (1 jour) sans chauffeur à son panier. Contact: 070000003 / sucaf@gmail.com	/admin/clients	f	\N	2026-08-18 10:03:51.026+00	2026-08-18 10:03:51.026+00
ab0b7f65-79e7-41cf-99ba-f89324eb0cdf	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	sucaf@gmail.com a ajouté la location "Mitsubishi Pajero 13" du 2026-08-18 au 2026-08-19 (1 jour) sans chauffeur à son panier. Contact: 070000003 / sucaf@gmail.com	/admin/clients	f	\N	2026-08-18 10:34:45.023+00	2026-08-18 10:34:45.023+00
11878245-367a-44a9-83cc-305d28840cac	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	sucaf@gmail.com a ajouté la location "Mitsubishi Pajero 13" du 2026-08-18 au 2026-08-19 (1 jour) sans chauffeur à son panier. Contact: 070000003 / sucaf@gmail.com	/admin/clients	f	\N	2026-08-18 10:37:13.192+00	2026-08-18 10:37:13.192+00
867aba98-9864-4683-83a2-1b744a008331	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	sucaf@gmail.com a ajouté la location "Mitsubishi Pajero 13" du 2026-08-18 au 2026-08-19 (1 jour) sans chauffeur à son panier. Contact: 070000003 / sucaf@gmail.com	/admin/clients	t	2026-08-18 16:18:42.873+00	2026-08-18 10:37:36.421+00	2026-08-18 16:18:42.873+00
70ed6328-9feb-4813-a79d-354634c96b64	3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	QUOTE_APPROVED	Devis envoyé !	Votre devis DMD-2026-4580 signé est disponible dans votre espace client.	/mes-devis	t	2026-08-18 10:47:42.914+00	2026-08-18 10:46:58.597+00	2026-08-18 10:47:42.914+00
6a25af87-508e-40e4-a1ab-4fe711d6230b	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	/admin/quotes	f	\N	2026-08-18 11:44:32.915+00	2026-08-18 11:44:32.915+00
851587d5-81ca-4328-ae8d-3ba82b475277	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-7628 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-18 11:44:32.917+00	2026-08-18 11:44:32.917+00
e9c397e7-d35d-4195-aa3b-760e145ee61d	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Renault OROCH" du 2026-08-18 au 2026-08-19 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	f	\N	2026-08-18 11:45:27.978+00	2026-08-18 11:45:27.978+00
dd284235-04d6-4549-ba72-6cb1bd40f1fa	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-9544 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-18 11:45:47.128+00	2026-08-18 11:45:47.128+00
f274dba4-920a-45a8-89ba-b2d2de06ff5d	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Renault OROCH" du 2026-08-18 au 2026-08-19 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	f	\N	2026-08-18 11:52:55.112+00	2026-08-18 11:52:55.112+00
62391115-b06a-4ea7-9ec7-5a40f78ebf12	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-5573 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-18 11:53:07.7+00	2026-08-18 11:53:07.7+00
1c65bfaa-ec37-4e15-9ead-4259db1defaa	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-2686 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-18 13:07:24.001+00	2026-08-18 13:07:24.001+00
c16ddb11-c3b6-4127-b19e-489f1c3f5c27	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Toyota Highlander" du 2026-08-18 au 2026-08-19 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	f	\N	2026-08-18 14:23:38.483+00	2026-08-18 14:23:38.483+00
90ace7b7-35c4-4f77-afaf-8efe3914690b	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	/admin/quotes	f	\N	2026-08-18 14:25:21.177+00	2026-08-18 14:25:21.177+00
5e982880-f33c-43fb-bfff-70356be1470d	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-4352 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-18 14:25:21.18+00	2026-08-18 14:25:21.18+00
9f1902b1-a52c-4ba3-b307-52530955d90c	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Citroën Jumper" du 2026-08-18 au 2026-08-19 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	f	\N	2026-08-18 14:33:49.959+00	2026-08-18 14:33:49.959+00
a70ea1ce-c036-44e5-a08a-ab5c5b1cc0ef	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-3210 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-18 14:34:15.011+00	2026-08-18 14:34:15.011+00
569dc9db-a6e1-47c6-9e92-e172ae777c67	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	/admin/quotes	t	2026-08-18 16:17:45.269+00	2026-08-18 13:07:23.996+00	2026-08-18 16:17:45.269+00
a848aa9a-f60f-4bfd-bdc7-47efd0cd4825	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Renault OROCH" du 2026-08-18 au 2026-08-19 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	t	2026-08-18 16:18:22.356+00	2026-08-18 11:52:52.756+00	2026-08-18 16:18:22.356+00
322ba69e-c785-48c0-8e80-66027644d6bb	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Renault OROCH" du 2026-08-18 au 2026-08-19 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	t	2026-08-18 16:18:27.31+00	2026-08-18 11:52:52.556+00	2026-08-18 16:18:27.31+00
b7377c06-ae15-46eb-a4e7-d0532291c796	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	/admin/quotes	t	2026-08-18 16:18:30.036+00	2026-08-18 11:45:47.125+00	2026-08-18 16:18:30.036+00
7428fc39-1fee-4d21-831d-a6d57630fd6d	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Mitsubishi Pajero 48" du 2026-08-18 au 2026-08-19 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	t	2026-08-18 16:18:39.569+00	2026-08-18 11:40:22.516+00	2026-08-18 16:18:39.569+00
d4974d89-bab7-4330-8317-3a389a70b94f	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Mitsubishi Pajero 13" du 2026-08-18 au 2026-08-19 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	t	2026-08-18 16:18:41.082+00	2026-08-18 10:37:56.887+00	2026-08-18 16:18:41.082+00
92486f60-85b8-4b3f-81ef-be702a84b5ab	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	Client Soutarah a ajouté la location "Renault OROCH" du 2026-08-18 au 2026-08-19 (1 jour) sans chauffeur à son panier. Contact: 0700000001 / client@soutarah.local	/admin/clients	t	2026-08-19 08:43:41.245+00	2026-08-18 15:24:45.282+00	2026-08-19 08:43:41.245+00
10006aab-e2b0-49a6-b531-e37a07efc5aa	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	/admin/quotes	t	2026-08-19 08:52:09.715+00	2026-08-18 14:34:15.006+00	2026-08-19 08:52:09.715+00
33491874-5655-4ea8-b7a0-1a7396ffa023	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Citroën Jumper" du 2026-08-18 au 2026-08-19 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	t	2026-08-19 08:52:16.012+00	2026-08-18 13:06:52.645+00	2026-08-19 08:52:16.012+00
5959219e-f106-47c6-b29d-d83c78b05fb6	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	/admin/quotes	t	2026-08-19 08:52:18.392+00	2026-08-18 11:53:07.698+00	2026-08-19 08:52:18.392+00
cf3d51d1-2e44-495a-a387-02b8a677a12b	5f1f291d-0fad-494b-bffb-9af5b9e14732	QUOTE_APPROVED	Devis envoyé !	Votre devis DMD-2026-3210 signé est disponible dans votre espace client.	/mes-devis	f	\N	2026-08-19 08:55:17.532+00	2026-08-19 08:55:17.532+00
2f1d04c4-2cd2-460d-87b1-b6c1a6425471	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Renault OROCH" du 2026-08-18 au 2026-08-19 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	t	2026-08-19 09:36:27.336+00	2026-08-18 14:37:45.531+00	2026-08-19 09:36:27.338+00
89c249a3-fa63-4729-bff6-dee346d34a41	5f1f291d-0fad-494b-bffb-9af5b9e14732	QUOTE_APPROVED	Devis envoyé !	Votre devis DMD-2026-4352 signé est disponible dans votre espace client.	/mes-devis	f	\N	2026-08-19 09:43:38.991+00	2026-08-19 09:43:38.991+00
4274eebd-034c-4048-a81e-b699b770c480	5f1f291d-0fad-494b-bffb-9af5b9e14732	QUOTE_APPROVED	Devis envoyé !	Votre devis DMD-2026-2686 signé est disponible dans votre espace client.	/mes-devis	t	2026-08-19 09:47:34.981+00	2026-08-19 09:46:47.836+00	2026-08-19 09:47:34.982+00
0f1d9e12-4991-42a8-bc18-15f41b68e2f6	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Renault OROCH" du 2026-08-18 au 2026-08-19 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	t	2026-08-19 10:06:31.18+00	2026-08-18 13:31:59.888+00	2026-08-19 10:06:31.18+00
b88cedfa-eed1-4c5e-996b-e3127d7abbf9	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Article ajouté au panier	David Sorho a ajouté "Ciment haute résistance" (x1) à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	f	\N	2026-08-19 10:16:03.089+00	2026-08-19 10:16:03.089+00
443099ef-1095-4fcc-9e13-0d351566a864	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Renault Duster" du 2026-08-19 au 2026-08-20 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	f	\N	2026-08-19 10:24:24.799+00	2026-08-19 10:24:24.799+00
8fe9843a-50e0-47fc-a700-0818fa40cb2c	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Citroën Jumper" du 2026-08-19 au 2026-08-20 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	f	\N	2026-08-19 10:34:11.29+00	2026-08-19 10:34:11.29+00
e3f86b72-08ed-4228-996d-cbd8ad6a90f5	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Renault OROCH" du 2026-08-19 au 2026-08-20 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	f	\N	2026-08-19 11:05:25.088+00	2026-08-19 11:05:25.088+00
acd31d80-0ca3-4fe1-adec-a9fc4ce66f19	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Renault OROCH" du 2026-08-19 au 2026-08-20 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	f	\N	2026-08-19 11:05:27.767+00	2026-08-19 11:05:27.767+00
3bac7327-567e-45f6-bf2e-678188021986	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Renault OROCH" du 2026-08-19 au 2026-08-20 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	f	\N	2026-08-19 11:05:30.648+00	2026-08-19 11:05:30.648+00
a0f9c608-ae24-4ae8-8ceb-834322da60ab	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	/admin/quotes	f	\N	2026-08-19 14:55:38.852+00	2026-08-19 14:55:38.852+00
45841d21-a1e1-4f51-8e29-0e60a523bc64	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-7797 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-19 14:55:38.873+00	2026-08-19 14:55:38.873+00
021d00d1-64a7-4357-af2a-a03ba4f1788c	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Renault OROCH" du 2026-08-19 au 2026-08-20 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	f	\N	2026-08-19 16:18:43.812+00	2026-08-19 16:18:43.812+00
11e17e0e-f47b-44a5-a1fb-aa71f9a2b638	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	/admin/quotes	f	\N	2026-08-19 16:19:41.54+00	2026-08-19 16:19:41.54+00
189a235b-e926-4843-8e0f-f795e5354490	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Article ajouté au panier	David Sorho a ajouté "Cable H200 2x2.5mm2 (rouleau 100m)" (x1) à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	f	\N	2026-08-19 16:29:59.155+00	2026-08-19 16:29:59.155+00
31bec219-2b05-48ed-8044-eae7cfd4cf5a	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	sucaf@gmail.com a ajouté la location "Mitsubishi Pajero 48" du 2026-08-19 au 2026-08-20 (1 jour) sans chauffeur à son panier. Contact: 070000003 / sucaf@gmail.com	/admin/clients	f	\N	2026-08-19 16:57:47.431+00	2026-08-19 16:57:47.431+00
daf402f9-cc47-430b-ab27-40f94dea06a6	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	sucaf@gmail.com a ajouté la location "Renault OROCH" du 2026-08-20 au 2026-08-21 (1 jour) sans chauffeur à son panier. Contact: 070000003 / sucaf@gmail.com	/admin/clients	f	\N	2026-08-20 10:39:45.494+00	2026-08-20 10:39:45.494+00
537f2f13-ab30-4574-ab95-0d0af7a42d44	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Article ajouté au panier	sucaf@gmail.com a ajouté "Cable H200 2x1.5mm2 (rouleau 100m)" (x1) à son panier. Contact: 070000003 / sucaf@gmail.com	/admin/clients	f	\N	2026-08-20 10:45:19.729+00	2026-08-20 10:45:19.729+00
29a4e788-8b5f-438c-bf86-3a333b0e5d8e	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	sucaf@gmail.com a ajouté la location "BMW X5" du 2026-08-20 au 2026-08-21 (1 jour) sans chauffeur à son panier. Contact: 070000003 / sucaf@gmail.com	/admin/clients	f	\N	2026-08-20 11:18:11.088+00	2026-08-20 11:18:11.088+00
8d07bf18-72b8-4b8f-b8d3-a3fa60bd3f20	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Article ajouté au panier	sucaf@gmail.com a ajouté "Cable H200 3x1.5mm2 (rouleau 100m)" (x1) à son panier. Contact: 070000003 / sucaf@gmail.com	/admin/clients	f	\N	2026-08-20 16:49:16.169+00	2026-08-20 16:49:16.169+00
5e6cb39e-6a12-4e90-86d5-4499d122fd69	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Panier mis à jour	sucaf@gmail.com a modifié la quantité de "Cable H200 3x1.5mm2 (rouleau 100m)" (maintenant x2). Contact: 070000003 / sucaf@gmail.com	/admin/clients	f	\N	2026-08-20 16:49:22.167+00	2026-08-20 16:49:22.167+00
0d06baf7-7468-4dfd-bf97-6cbc44ff3a8a	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Article ajouté au panier	sucaf@gmail.com a ajouté "Cadenas acier 50mm" (x1) à son panier. Contact: 070000003 / sucaf@gmail.com	/admin/clients	f	\N	2026-08-20 16:49:44.146+00	2026-08-20 16:49:44.146+00
557bbbda-6ff9-45b1-9783-38779e9aa54f	5f1f291d-0fad-494b-bffb-9af5b9e14732	QUOTE_APPROVED	Devis envoyé !	Votre devis DMD-2026-8689 signé est disponible dans votre espace client.	/mes-devis	t	2026-08-21 11:27:06.295+00	2026-08-19 16:49:26.663+00	2026-08-21 11:27:06.295+00
42eaf0ac-42ed-4b53-8d75-c2e8f3f0c9c1	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-8689 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	t	2026-08-21 11:27:11.693+00	2026-08-19 16:19:41.545+00	2026-08-21 11:27:11.693+00
9f2bc31d-51f0-42b4-ae4b-f1f5ac6d1fa8	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	VEHICLE_REQUEST	Nouvelle réservation de véhicule	David Sorho a réservé Chevrolet Spark du 2026-08-21T11:32:00.000Z au 2026-08-22T11:32:00.000Z (2j). Réf: RES-2026-6509	/admin/reservations	f	\N	2026-08-21 11:33:10.46+00	2026-08-21 11:33:10.46+00
715e2bbd-69db-43a5-b4fc-aa9930c37e44	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-7029 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	t	2026-08-21 11:35:00.328+00	2026-08-21 11:34:50.176+00	2026-08-21 11:35:00.328+00
b4b47193-ab2a-4698-b026-b757ad496154	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	VEHICLE_REQUEST	Nouvelle réservation de véhicule	David Sorho a réservé Ford Escape du 2026-08-21T12:06:31.283Z au 2026-08-22T12:06:31.283Z (2j). Réf: RES-2026-4592	/admin/reservations	t	2026-08-21 12:10:45.831+00	2026-08-21 12:06:40.631+00	2026-08-21 12:10:45.831+00
63faeaa1-1a3a-454b-85ed-7d5ec1bcf3e2	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	/admin/quotes	t	2026-08-21 17:08:46.181+00	2026-08-21 11:34:50.173+00	2026-08-21 17:08:46.181+00
d43f688f-1db4-47b3-b4d9-925184947142	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Audi A6" du 2026-08-21 au 2026-08-22 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	f	\N	2026-08-21 17:33:05.003+00	2026-08-21 17:33:05.003+00
f83dbe20-0dd2-464f-be22-6069046a38fc	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	CART_ITEM_ADDED	Location ajoutée au panier	David Sorho a ajouté la location "Renault OROCH" du 2026-08-22 au 2026-08-23 (1 jour) sans chauffeur à son panier. Contact: 0584278638 / sorhodavid31@gmail.com	/admin/clients	f	\N	2026-08-22 09:14:26.124+00	2026-08-22 09:14:26.124+00
92fd6a95-4678-417e-871a-9e71920d4225	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Demande de devis (DMD-2026-9913).	/admin/quotes	f	\N	2026-08-22 10:09:46.986+00	2026-08-22 10:09:46.986+00
12978885-f330-428c-8c47-e01ae7906714	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-5556 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-22 10:09:46.993+00	2026-08-22 10:09:46.993+00
c0704526-f07b-4c03-8c4f-0c6ddb2268c4	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Demande de devis (DMD-2026-5886).	/admin/quotes	f	\N	2026-08-22 10:20:56.762+00	2026-08-22 10:20:56.762+00
97230a1e-ee77-4d53-8b93-7d34d2bdd7e7	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-9640 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-22 10:20:56.77+00	2026-08-22 10:20:56.77+00
9e19d05f-e630-4d6c-ab90-452319436ba6	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Demande de devis (DMD-2026-6757).	/admin/quotes	f	\N	2026-08-22 10:54:02.569+00	2026-08-22 10:54:02.569+00
6dcead91-4621-4483-913c-e95e698c2e41	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-4639 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-22 10:54:02.616+00	2026-08-22 10:54:02.616+00
04900c07-1abb-4618-a048-401058d84997	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	sorhodavid31 a envoyé une demande de devis : Ajout au panier: Hyundai H350.	/admin/quotes	f	\N	2026-08-22 11:27:35.108+00	2026-08-22 11:27:35.108+00
ed9fe8b1-8c35-44ee-81a8-9526ce97a44d	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-2683 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-22 11:27:35.117+00	2026-08-22 11:27:35.117+00
d24b67ff-44eb-46a9-a644-a0e377dd80f8	5f1f291d-0fad-494b-bffb-9af5b9e14732	QUOTE_APPROVED	Devis envoyé !	Votre devis DMD-2026-2683 signé est disponible dans votre espace client.	/mes-devis	f	\N	2026-08-22 11:30:34.113+00	2026-08-22 11:30:34.113+00
81c791c4-e5e1-4bfa-a539-99ecf9d1d252	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	/admin/quotes	f	\N	2026-08-23 18:00:55.531+00	2026-08-23 18:00:55.531+00
a84b25a7-cdd8-43fa-94a0-bce3cea682bd	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-2814 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-23 18:00:55.556+00	2026-08-23 18:00:55.556+00
61c6030e-3862-451e-b872-6ef6868b6661	1b1d0c59-982a-4ffc-8bbb-9d73878fa642	QUOTE_REQUEST_CREATED	Nouvelle demande de devis	David Sorho a envoyé une demande de devis : Devis Panier SOUTARAH.	/admin/quotes	f	\N	2026-08-23 18:02:38.189+00	2026-08-23 18:02:38.189+00
fdf54b76-e8b4-42a4-8699-84115c196e5f	5f1f291d-0fad-494b-bffb-9af5b9e14732	CART_VALIDATED	Panier validé - Devis enregistré	Votre demande de devis DMD-2026-2539 a été enregistrée avec succès. Retrouvez-la dans "Mes devis".	/client/devis	f	\N	2026-08-23 18:02:38.194+00	2026-08-23 18:02:38.194+00
\.


--
-- Data for Name: paniers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paniers (id, client_id, statut, cree_le, mis_a_jour_le) FROM stdin;
58da42c6-4405-45b5-a1bf-36db0d6ea469	2c91e316-d2dc-4202-abf0-76e01df601d4	ACTIVE	2026-08-13 08:47:18.505+00	2026-08-13 08:47:18.505+00
a0458c26-4581-4ffb-9d90-14985eb4b5ed	fa515ab8-40ff-44d6-b1ab-94ee851a8290	ACTIVE	2026-08-13 13:45:39.822+00	2026-08-13 13:45:39.822+00
5006fb68-c0e8-4c11-b2e7-d97a15391224	2162822c-f3ae-42ea-a2d8-715b9eb4fda4	ACTIVE	2026-08-18 10:03:22.274+00	2026-08-18 10:03:22.274+00
\.


--
-- Data for Name: parametres; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parametres (id, cle, valeur, cree_le, mis_a_jour_le) FROM stdin;
6574ece8-1e12-4a59-9289-3fdd6101f6f7	profile	{"name": "admin", "role": "Administrateur", "email": "admin@gmail.com", "phone": ""}	2026-08-15 16:46:06.24+00	2026-08-15 16:46:06.24+00
4fe1b3f7-6eb0-4d14-9e62-8bf6634cc0e8	company	{"name": "SOUTARAH GROUP", "email": "contact@soutarah.com", "phone": "+225 07 18 38 38 38", "address": "Riviera Palmeraie Saint Viateur, Cité Kimi", "website": "www.soutarah.com", "description": "Négoce de quincaillerie, plomberie, fournitures BTP, énergie solaire, location de véhicules et gestion de projets."}	2026-08-15 16:46:06.25+00	2026-08-15 16:46:06.25+00
7afbc76a-cea8-476f-a6fe-c56587f01188	notifications	{"newQuote": true, "newClient": true, "emailAlerts": true, "newReservation": true}	2026-08-15 16:46:06.256+00	2026-08-15 16:46:06.256+00
3c4dd831-1627-461d-8560-4dea86684268	shop	{"currency": "FCFA", "language": "Français", "timezone": "Africa/Abidjan (GMT+0)", "maintenanceMode": false}	2026-08-15 16:46:06.263+00	2026-08-15 16:46:06.263+00
a66fbefb-a0a5-4b64-bfee-bca065efed8a	announcements	{"items": [{"id": null, "text": "Riviera Palmeraie Saint Viateur, Cité Kimi — +225 07 18 38 38 38", "color": "transparent", "order": 0, "enabled": true, "sticker": "", "duration": 8, "textSize": "text-[11px]", "fontStyle": "font-bold", "uppercase": true}, {"id": null, "text": "Location de véhicules & Flottes — Réservez dès maintenant", "color": "transparent", "order": 1, "enabled": true, "sticker": "", "duration": 8, "textSize": "text-[11px]", "fontStyle": "font-bold", "uppercase": true}, {"id": null, "text": "Négoce de quincaillerie, plomberie & fournitures BTP", "color": "transparent", "order": 2, "enabled": true, "sticker": "", "duration": 8, "textSize": "text-[11px]", "fontStyle": "font-bold", "uppercase": true}], "barHeight": 36}	2026-08-17 07:43:02.22+00	2026-08-19 16:52:04.85+00
51bf07f9-df79-416f-84f0-fc03165e89d2	quoteEmails	["contact@soutarah.com", "sorhodavid550@gmail.com"]	2026-08-15 16:46:06.26+00	2026-08-17 11:13:22.991+00
\.


--
-- Data for Name: produits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.produits (id, categorie_id, nom, reference, description, image_url, unite, stock, seuil_alerte, statut, cree_le, mis_a_jour_le) FROM stdin;
ec3d252c-37ac-46e0-baaa-c18b34989eb8	0a493024-eee9-4166-9d39-35e40f502b4d	Cable H200 3x1.5mm2 (rouleau 100m)	CBL-H200-3X15	Cable electrique H200 3 conducteurs 1.5mm2, avec terre.	https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop	rouleau	35.000	6.000	ACTIVE	2026-08-17 09:36:04.48+00	2026-08-17 10:35:02.227+00
7170ce4d-09f0-4ba4-b1f6-adc637224cd6	0a493024-eee9-4166-9d39-35e40f502b4d	Cable H200 3x2.5mm2 (rouleau 100m)	CBL-H200-3X25	Cable electrique H200 3 conducteurs 2.5mm2.	https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop	rouleau	30.000	5.000	ACTIVE	2026-08-17 09:36:04.531+00	2026-08-17 10:35:02.228+00
d67e063f-b2f6-42c6-a637-1987f926a44e	0a493024-eee9-4166-9d39-35e40f502b4d	Disjoncteur 16A 1P	CBL-DIS-16A	Disjoncteur modulaire 16A unipolaire.	https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop	unite	60.000	10.000	ACTIVE	2026-08-17 09:36:04.622+00	2026-08-17 10:35:02.23+00
d3713909-7dd3-4420-ad61-f432ec403f95	0a493024-eee9-4166-9d39-35e40f502b4d	Disjoncteur 32A 2P	CBL-DIS-32A	Disjoncteur modulaire 32A bipolaire.	https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop	unite	40.000	8.000	ACTIVE	2026-08-17 09:36:04.667+00	2026-08-17 10:35:02.232+00
9758351a-6480-4c4b-afa2-4db21d00c7ee	6c6e8ecb-bae8-4419-9485-b7b5df85cd6b	Ciment haute résistance	MAT-CIM-50	Sac de ciment pour travaux de construction et de rénovation.	\N	sac	200.000	30.000	ACTIVE	2026-08-13 08:40:19.561+00	2026-08-14 10:38:54.905+00
43088269-7b8c-45de-9005-4c4a3d6a07ac	cde27e41-2faf-4295-9b05-bea01050efc5	Tuyau PVC 50 (barre 6m)	PLB-PVC-50	Tuyau PVC 50 pour evacuation des eaux usees.	https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop	barre	100.000	15.000	ACTIVE	2026-08-17 09:36:05.072+00	2026-08-17 10:35:02.199+00
b45e83cf-c63c-4082-8fbb-f1ed21ac92a6	cde27e41-2faf-4295-9b05-bea01050efc5	Tuyau PVC 75 (barre 6m)	PLB-PVC-75	Tuyau PVC 75 pour evacuation principale.	https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop	barre	80.000	12.000	ACTIVE	2026-08-17 09:36:05.094+00	2026-08-17 10:35:02.201+00
2b10b685-e303-4707-a59b-701e3756743a	6c6e8ecb-bae8-4419-9485-b7b5df85cd6b	Équipement de protection chantier	MAT-EPI-01	Équipement de protection pour les équipes et interventions terrain.	\N	kit	40.000	10.000	ACTIVE	2026-08-13 08:40:19.589+00	2026-08-14 10:38:54.976+00
b13e7225-dd6b-4d16-ad59-761516c5043d	b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33	Clou acier 60mm (kg)	QNC-CLN-60	Clous en acier doux pour charpente et coffrage.	https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop	kg	80.000	10.000	ACTIVE	2026-08-17 09:36:04.074+00	2026-08-17 10:35:02.216+00
6d7f1495-4ba1-47e9-a4bf-39e07455827f	b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33	Charniere inox 100mm (paire)	QNC-CHR-INOX	Charniere en inox 304, usage interieur et exterieur.	https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop	paire	60.000	10.000	ACTIVE	2026-08-17 09:36:04.103+00	2026-08-17 10:35:02.217+00
2d7b9c26-1212-4673-af97-a9491f5d99ca	b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33	Serrure 3 points a cylindre	QNC-SER-3PT	Serrure de securite 3 points avec cylindre europeen.	https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop	unite	25.000	5.000	ACTIVE	2026-08-17 09:36:04.13+00	2026-08-17 10:35:02.218+00
93b3184d-914c-410f-ba8e-db4c4bcf5338	b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33	Cadenas acier 50mm	QNC-CDN-50	Cadenas en acier trempe avec 3 cles.	https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop	unite	45.000	8.000	ACTIVE	2026-08-17 09:36:04.159+00	2026-08-17 10:35:02.219+00
6d280bba-fe63-42c9-be0d-aabe50c2e6a4	b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33	Marteau de menuisier 500g	QNC-MRT-500	Marteau de menuisier avec manche en bois.	https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop	unite	30.000	5.000	ACTIVE	2026-08-17 09:36:04.214+00	2026-08-17 10:35:02.22+00
3c3d36e4-a109-4e1e-9b4f-379d447f7aab	b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33	Pince multiprise 250mm	QNC-PNC-250	Pince multiprise reglable en acier chrome.	https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop	unite	28.000	5.000	ACTIVE	2026-08-17 09:36:04.314+00	2026-08-17 10:35:02.222+00
c7519402-6c6c-4ead-b185-ed723f1576e8	0a493024-eee9-4166-9d39-35e40f502b4d	Cable H200 2x2.5mm2 (rouleau 100m)	CBL-H200-2X25	Cable electrique H200 2 conducteurs 2.5mm2.	https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop	rouleau	40.000	8.000	ACTIVE	2026-08-17 09:36:04.434+00	2026-08-17 10:35:02.226+00
95900c76-fe8c-4a21-9bc0-d8ff3d3e87dd	0a493024-eee9-4166-9d39-35e40f502b4d	Interrupteur simple allumage	CBL-INT-SIMPLE	Interrupteur simple allumage encastrable.	https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop	unite	80.000	15.000	ACTIVE	2026-08-17 09:36:04.709+00	2026-08-17 10:35:02.233+00
33f08068-90b2-45ac-a363-776320ee34b9	0a493024-eee9-4166-9d39-35e40f502b4d	Prise de courant 2P+T 16A	CBL-PRS-16A	Prise de courant encastrable 2P+T 16A.	https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop	unite	70.000	12.000	ACTIVE	2026-08-17 09:36:04.753+00	2026-08-17 10:35:02.234+00
3a8db114-22ac-4794-a4b9-74ec29beff6e	0a493024-eee9-4166-9d39-35e40f502b4d	Gaine ICTA 20mm (rouleau 25m)	CBL-GNT-20	Gaine isolante ICTA 20mm pour protection des cables.	https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop	rouleau	55.000	10.000	ACTIVE	2026-08-17 09:36:04.8+00	2026-08-17 10:35:02.236+00
d97fc8d6-62cc-40cf-a285-2b7c8ff25a9d	fb9a9898-0e06-4a0f-950e-e13bca63020d	Groupe electrogene essence 2.5kVA	GRP-ESS-25	Groupe electrogene essence 2.5kVA, demarrage manuel.	https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop	unite	10.000	2.000	ACTIVE	2026-08-17 09:36:04.853+00	2026-08-17 10:35:02.239+00
14620dac-16b2-4062-8dd1-2fdf3022a7f2	fb9a9898-0e06-4a0f-950e-e13bca63020d	Groupe electrogene diesel 5kVA	GRP-DSL-5	Groupe electrogene diesel 5kVA, demarrage electrique.	https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop	unite	6.000	1.000	ACTIVE	2026-08-17 09:36:04.932+00	2026-08-17 10:35:02.24+00
8f43ce88-3f6d-4df7-8306-1cb4de252357	fb9a9898-0e06-4a0f-950e-e13bca63020d	Groupe electrogene diesel 10kVA	GRP-DSL-10	Groupe electrogene diesel 10kVA, demarrage electrique.	https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop	unite	4.000	1.000	ACTIVE	2026-08-17 09:36:04.978+00	2026-08-17 10:35:02.242+00
57a828e8-d90a-44e2-a02b-9d18b9b7f901	fb9a9898-0e06-4a0f-950e-e13bca63020d	Groupe electrogene diesel 15kVA	GRP-DSL-15	Groupe electrogene diesel 15kVA, demarrage electrique.	https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop	unite	3.000	1.000	ACTIVE	2026-08-17 09:36:05.002+00	2026-08-17 10:35:02.243+00
3258b44b-5b68-4e5d-9ac4-4ab4cc18031d	fb9a9898-0e06-4a0f-950e-e13bca63020d	Groupe electrogene diesel 20kVA	GRP-DSL-20	Groupe electrogene diesel 20kVA, demarrage electrique.	https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop	unite	2.000	1.000	ACTIVE	2026-08-17 09:36:05.023+00	2026-08-17 10:35:02.244+00
091d3454-76d9-43b9-a640-6f1019c83f2e	fb9a9898-0e06-4a0f-950e-e13bca63020d	Groupe electrogene diesel 30kVA	GRP-DSL-30	Groupe electrogene diesel 30kVA, demarrage electrique.	https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop	unite	2.000	1.000	ACTIVE	2026-08-17 09:36:05.045+00	2026-08-17 10:35:02.245+00
d0ce3a32-fbe2-436a-abab-d8db0d5190cd	cde27e41-2faf-4295-9b05-bea01050efc5	Raccord PVC 50 (coude 90)	PLB-RCD-50	Coude PVC 50 a 90 pour evacuation.	https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop	unite	200.000	30.000	ACTIVE	2026-08-17 09:36:05.15+00	2026-08-17 10:35:02.202+00
6eb0a5ef-b0cf-4a95-baf2-0808197b740b	cde27e41-2faf-4295-9b05-bea01050efc5	Raccord PVC 75 (coude 90)	PLB-RCD-75	Coude PVC 75 a 90 pour evacuation.	https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop	unite	150.000	25.000	ACTIVE	2026-08-17 09:36:05.176+00	2026-08-17 10:35:02.204+00
6792db60-4242-40df-b2b1-853ece9cbd55	cde27e41-2faf-4295-9b05-bea01050efc5	Raccord PVC 100 (coude 90)	PLB-RCD-100	Coude PVC 100 a 90 pour evacuation.	https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop	unite	100.000	15.000	ACTIVE	2026-08-17 09:36:05.203+00	2026-08-17 10:35:02.205+00
86d9cd49-7555-4d8b-85e1-4e3e278db4af	cde27e41-2faf-4295-9b05-bea01050efc5	Tube PVC pression Ø32	PVC-032P	Tube PVC pression adapté aux installations durables.	https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop	unité	80.000	15.000	ACTIVE	2026-08-13 08:40:19.525+00	2026-08-17 10:35:02.208+00
ea40a920-4f14-470f-937e-1ee11b4d8106	b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33	Boulon hexagonale M8x30 (lot de 50)	QNC-BLT-M8X30	Boulons hexagonaux M8 avec ecrous et rondelles.	https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop	lot	100.000	15.000	ACTIVE	2026-08-17 09:36:04.041+00	2026-08-17 10:35:02.215+00
a01aaf44-8049-43c4-8761-2a82028eeec1	55c7dd48-b498-49e2-8735-82885876ff36	Ciment CPJ 42.5 (sac 50kg)	MTC-CIM-425	Ciment CPJ 42.5 pour beton arme et maconnerie.	https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop	sac	200.000	30.000	ACTIVE	2026-08-17 09:36:05.483+00	2026-08-17 10:35:02.257+00
d6754703-ec42-463f-a8d3-8bb4e55333e3	cde27e41-2faf-4295-9b05-bea01050efc5	Tuyau PVC Ø50	PVC-050	Tuyau PVC robuste pour réseaux d’eau et installations de plomberie.	https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop	unité	120.000	20.000	ACTIVE	2026-08-13 08:40:19.477+00	2026-08-17 10:35:02.185+00
3af6050b-0ef6-48f1-a873-d0366324c941	cde27e41-2faf-4295-9b05-bea01050efc5	Robinet arret 1/2	PLB-RBN-12	Robinet arret laiton 1/2 pour alimentation.	https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop	unite	90.000	15.000	ACTIVE	2026-08-17 09:36:05.225+00	2026-08-17 10:35:02.206+00
77505776-790d-4c68-92b8-211bce55971e	cde27e41-2faf-4295-9b05-bea01050efc5	Tuyau PVC 100 (barre 6m)	PLB-PVC-100	Tuyau PVC 100 pour evacuation principale.	https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop	barre	60.000	10.000	ACTIVE	2026-08-17 09:36:05.119+00	2026-08-17 10:35:02.209+00
c7d3bc70-3ac5-483e-8a20-5e62cf70001d	cde27e41-2faf-4295-9b05-bea01050efc5	Robinet arret 3/4	PLB-RBN-34	Robinet arret laiton 3/4 pour alimentation.	https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop	unite	70.000	12.000	ACTIVE	2026-08-17 09:36:05.246+00	2026-08-17 10:35:02.21+00
5c4c8f45-9c8e-4d17-accf-29da3d4ae5ea	cde27e41-2faf-4295-9b05-bea01050efc5	Flexible inox 1/2 x 40cm	PLB-FLX-40	Flexible inox tresse 1/2 pour raccordement sanitaire.	https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop	unite	120.000	20.000	ACTIVE	2026-08-17 09:36:05.269+00	2026-08-17 10:35:02.211+00
e60b7279-7b24-4e4f-a16e-8e2a60741801	cde27e41-2faf-4295-9b05-bea01050efc5	Siphon lavabo PVC	PLB-SPH-LAV	Siphon lavabo PVC avec tube de vidage.	https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop	unite	60.000	10.000	ACTIVE	2026-08-17 09:36:05.29+00	2026-08-17 10:35:02.212+00
b423f1af-2854-4ff2-a71c-6ca3195e53bc	b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33	Tournevis cruciforme set 6 pieces	QNC-TRN-6P	Set de 6 tournevis cruciformes et plats.	https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop	set	35.000	5.000	ACTIVE	2026-08-17 09:36:04.262+00	2026-08-17 10:35:02.221+00
b9dbdd60-0e71-4aa8-a448-d721e28fd76c	b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33	Vis a bois galvanisees 4x40 (boite de 100)	QNC-VIS-4X40	Vis a bois galvanisees, resistantes a la corrosion.	https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop	boite	150.000	20.000	ACTIVE	2026-08-17 09:36:03.985+00	2026-08-17 10:35:02.223+00
e4d37252-1f61-4623-a454-c8da522af4d6	b26e8ea3-a8f7-4021-b7a5-a4af5cffcf33	Cheville universelle 8mm (boite de 50)	QNC-CHV-8	Chevilles universelles nylon pour beton, brique et placoplatre.	https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop	boite	120.000	20.000	ACTIVE	2026-08-17 09:36:04.186+00	2026-08-17 10:35:02.224+00
1588473f-d2a6-4e4d-85bd-a1f4ad54b080	0a493024-eee9-4166-9d39-35e40f502b4d	Cable H200 2x1.5mm2 (rouleau 100m)	CBL-H200-2X15	Cable electrique H200 2 conducteurs 1.5mm2.	https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop	rouleau	50.000	8.000	ACTIVE	2026-08-17 09:36:04.38+00	2026-08-17 10:35:02.231+00
15c352b3-3d99-46e0-8946-be51b6033f0d	0a493024-eee9-4166-9d39-35e40f502b4d	Cable H200 4x6mm2 (rouleau 100m)	CBL-H200-4X6	Cable electrique H200 4 conducteurs 6mm2.	https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop	rouleau	20.000	4.000	ACTIVE	2026-08-17 09:36:04.577+00	2026-08-17 10:35:02.237+00
683f985d-4664-4212-aa26-6205c82e4bb0	fb9a9898-0e06-4a0f-950e-e13bca63020d	Groupe electrogene diesel 7.5kVA	GRP-DSL-75	Groupe electrogene diesel 7.5kVA, demarrage electrique.	https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop	unite	5.000	1.000	ACTIVE	2026-08-17 09:36:04.955+00	2026-08-17 10:35:02.241+00
fbb230d8-bdfa-472b-9d8a-5d3acb8a5579	fb9a9898-0e06-4a0f-950e-e13bca63020d	Groupe electrogene essence 3.5kVA	GRP-ESS-35	Groupe electrogene essence 3.5kVA, demarrage manuel.	https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop	unite	8.000	2.000	ACTIVE	2026-08-17 09:36:04.903+00	2026-08-17 10:35:02.246+00
50c60692-9256-4890-b2e6-a06022cfe1c1	069c5baf-3e8b-4f6a-a8f5-c391bc83fd2d	Peinture acrylique blanche 10L	PNT-ACR-10	Peinture acrylique blanche mate pour murs.	https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop	pot	40.000	8.000	ACTIVE	2026-08-17 09:36:05.318+00	2026-08-17 10:35:02.248+00
a493f297-5b1e-4d70-ab5c-5e4765c91443	069c5baf-3e8b-4f6a-a8f5-c391bc83fd2d	Peinture glycerophtalique 5L	PNT-GLY-5	Peinture glycerophtalique sainee pour boiseries.	https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop	pot	30.000	6.000	ACTIVE	2026-08-17 09:36:05.339+00	2026-08-17 10:35:02.249+00
a1133c0f-3d85-4362-8e80-5215f8ab8d8d	069c5baf-3e8b-4f6a-a8f5-c391bc83fd2d	Enduit de lissage 25kg	PNT-END-25	Enduit de lissage pret a emploi.	https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop	sac	50.000	10.000	ACTIVE	2026-08-17 09:36:05.361+00	2026-08-17 10:35:02.251+00
527116ce-d9a7-4479-9e25-1b8dfa046ea0	069c5baf-3e8b-4f6a-a8f5-c391bc83fd2d	Sous-couche universelle 5L	PNT-SSC-5	Sous-couche universelle pour preparer les surfaces.	https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop	pot	25.000	5.000	ACTIVE	2026-08-17 09:36:05.385+00	2026-08-17 10:35:02.252+00
b4cc8ca0-0814-4c5a-9af9-530aa72da701	069c5baf-3e8b-4f6a-a8f5-c391bc83fd2d	Rouleau a peindre 25cm	PNT-RLP-25	Rouleau a peindre 25cm avec manche.	https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop	unite	45.000	8.000	ACTIVE	2026-08-17 09:36:05.413+00	2026-08-17 10:35:02.253+00
fd00f75c-3124-4237-a15e-62a3b483b0ac	069c5baf-3e8b-4f6a-a8f5-c391bc83fd2d	Pinceau plat 50mm	PNT-PNC-50	Pinceau plat 50mm pour finitions et angles.	https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop	unite	60.000	10.000	ACTIVE	2026-08-17 09:36:05.444+00	2026-08-17 10:35:02.254+00
6cf02f55-bc03-4928-9b0b-3b07d24691cd	55c7dd48-b498-49e2-8735-82885876ff36	Tole bac acier 2m	MTC-TLE-2	Tole bac acier galvanisee 2m pour toiture.	https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop	unite	80.000	10.000	ACTIVE	2026-08-17 09:36:05.646+00	2026-08-17 10:35:02.256+00
e00da07f-19e4-4f6b-a728-fdcaecf40829	55c7dd48-b498-49e2-8735-82885876ff36	Fer a beton 8 (barre 12m)	MTC-FER-8	Fer a beton 8 haute adherence, barre de 12m.	https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop	barre	150.000	20.000	ACTIVE	2026-08-17 09:36:05.515+00	2026-08-17 10:35:02.258+00
1197bd79-9786-403b-b52b-40385ea4f53c	55c7dd48-b498-49e2-8735-82885876ff36	Fer a beton 10 (barre 12m)	MTC-FER-10	Fer a beton 10 haute adherence, barre de 12m.	https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop	barre	120.000	15.000	ACTIVE	2026-08-17 09:36:05.538+00	2026-08-17 10:35:02.259+00
ca9b27d6-ada5-4be7-b9d7-698ef888d353	55c7dd48-b498-49e2-8735-82885876ff36	Fer a beton 12 (barre 12m)	MTC-FER-12	Fer a beton 12 haute adherence, barre de 12m.	https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop	barre	100.000	15.000	ACTIVE	2026-08-17 09:36:05.558+00	2026-08-17 10:35:02.26+00
45c8ff2d-f246-4ce6-a1bd-e9d3b872ac4e	55c7dd48-b498-49e2-8735-82885876ff36	Sable de riviere (m3)	MTC-SBL-1	Sable de riviere lave pour beton et maconnerie.	https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop	m3	30.000	5.000	ACTIVE	2026-08-17 09:36:05.578+00	2026-08-17 10:35:02.261+00
c07e0e5e-c3b1-472d-b7b1-5cbbd4888f0f	55c7dd48-b498-49e2-8735-82885876ff36	Gravier concasse (m3)	MTC-GRV-1	Gravier concasse 15/25 pour beton.	https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop	m3	25.000	5.000	ACTIVE	2026-08-17 09:36:05.599+00	2026-08-17 10:35:02.262+00
23ea8071-f2c7-493a-9158-18e73b5d2b1e	55c7dd48-b498-49e2-8735-82885876ff36	Parpaing creux 15x20x40	MTC-PRP-15	Parpaing creux 15x20x40 pour murs porteurs.	https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop	unite	500.000	50.000	ACTIVE	2026-08-17 09:36:05.621+00	2026-08-17 10:35:02.263+00
c91be8ed-514f-492f-a863-5db0eec9901e	\N	TOIT	Y3GYEU78		\N	kg	0.000	0.000	ACTIVE	2026-08-17 15:24:03.352+00	2026-08-17 15:24:03.352+00
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (id, produit_id, vehicule_id, titre, description, image_url, prix_normal, prix_promotionnel, commence_le, termine_le, statut, cree_le, mis_a_jour_le) FROM stdin;
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservations (id, client_id, vehicule_id, reference, commence_le, termine_le, statut, prix_journalier, montant_total, avec_chauffeur, expire_le, note_gestionnaire, cree_le, mis_a_jour_le) FROM stdin;
891939cd-8271-4309-87b9-8ebec88ab3b0	fa515ab8-40ff-44d6-b1ab-94ee851a8290	d6aa2dbf-24d2-4128-b82c-fe6abfff0a3e	RES-DMD-2026-8158	2026-08-18 09:42:45.297+00	2026-08-21 09:42:45.297+00	CONFIRMED	135000.00	405000.00	f	2026-08-21 09:42:45.297+00	Devis DMD-2026-8158 approuvé - Devis Panier SOUTARAH	2026-08-18 09:42:45.301+00	2026-08-18 09:42:45.301+00
c4e367f2-c882-4c26-8322-72db4ae1b292	fa515ab8-40ff-44d6-b1ab-94ee851a8290	c07289c4-d708-4ecb-b308-68dfd68f3a1f	RES-2026-6509	2026-08-21 11:32:00+00	2026-08-23 11:32:00+00	PENDING	16000.00	32000.00	f	2026-08-23 11:33:10.445+00	Destination: Abidjan	2026-08-21 11:33:10.445+00	2026-08-21 11:33:10.445+00
dc29e24f-8c21-4451-90e3-d9d3b4ae760d	fa515ab8-40ff-44d6-b1ab-94ee851a8290	ed74e06d-05cd-4dee-bbd8-59bf181a41b3	RES-2026-4592	2026-08-21 12:06:31.283+00	2026-08-23 12:06:31.283+00	CONFIRMED	45000.00	90000.00	f	2026-08-23 12:06:40.625+00	Destination: Abidjan	2026-08-21 12:06:40.626+00	2026-08-21 12:11:05.542+00
\.


--
-- Data for Name: tarifs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tarifs (id, produit_id, type_client, prix, cree_le, mis_a_jour_le, entreprise_id) FROM stdin;
9e996ab2-c1e1-4d63-88b4-142b40336b6e	c91be8ed-514f-492f-a863-5db0eec9901e	PARTICULIER	315.00	2026-08-17 15:24:03.357+00	2026-08-17 15:24:03.357+00	\N
b367bb68-2930-4176-a400-ba31482940cb	1588473f-d2a6-4e4d-85bd-a1f4ad54b080	PARTICULIER	35000.00	2026-08-17 09:36:04.403+00	2026-08-17 09:36:04.41+00	\N
505f4688-2848-4941-bd8e-2603bfc9d04a	1588473f-d2a6-4e4d-85bd-a1f4ad54b080	ENTREPRISE	29000.00	2026-08-17 09:36:04.419+00	2026-08-17 09:36:04.426+00	\N
e4ca8e0b-aea4-41ed-85ee-319b1f094e69	c7519402-6c6c-4ead-b185-ed723f1576e8	PARTICULIER	45000.00	2026-08-17 09:36:04.45+00	2026-08-17 09:36:04.458+00	\N
25134fcb-edc3-4db3-bc23-02511b92cd85	c7519402-6c6c-4ead-b185-ed723f1576e8	ENTREPRISE	38000.00	2026-08-17 09:36:04.466+00	2026-08-17 09:36:04.473+00	\N
093f006c-5c1a-4165-9020-cc510ed2f2d3	9758351a-6480-4c4b-afa2-4db21d00c7ee	PARTICULIER	6200.00	2026-08-14 10:38:54.93+00	2026-08-14 10:38:54.93+00	\N
c9a6d3dd-ccc3-4104-906a-79144521b952	9758351a-6480-4c4b-afa2-4db21d00c7ee	ENTREPRISE	5900.00	2026-08-14 10:38:54.939+00	2026-08-14 10:38:54.939+00	\N
90bd2fb5-88ac-4827-a93e-f4cc80150af4	86d9cd49-7555-4d8b-85e1-4e3e278db4af	PARTICULIER	7500.00	2026-08-14 10:38:54.951+00	2026-08-14 10:38:54.951+00	\N
5c35f462-ad7a-4332-9fda-12a260d7a629	86d9cd49-7555-4d8b-85e1-4e3e278db4af	ENTREPRISE	6500.00	2026-08-14 10:38:54.954+00	2026-08-14 10:38:54.954+00	\N
4a72cf2d-1eca-412a-84bb-faec527d14b2	d6754703-ec42-463f-a8d3-8bb4e55333e3	PARTICULIER	10000.00	2026-08-14 10:38:54.966+00	2026-08-14 10:38:54.966+00	\N
235d9226-b236-46c1-ae88-d47017bd91da	d6754703-ec42-463f-a8d3-8bb4e55333e3	ENTREPRISE	8500.00	2026-08-14 10:38:54.969+00	2026-08-14 10:38:54.969+00	\N
4854bdc5-e348-49b5-82c1-805fda49a0e2	2b10b685-e303-4707-a59b-701e3756743a	PARTICULIER	18000.00	2026-08-14 10:38:54.981+00	2026-08-14 10:38:54.981+00	\N
dab07dbd-999b-4a04-8c39-f6dc2641242a	2b10b685-e303-4707-a59b-701e3756743a	ENTREPRISE	15500.00	2026-08-14 10:38:54.984+00	2026-08-14 10:38:54.984+00	\N
538c227c-8062-4ca1-ab7a-5dd9c8e9c0c6	b9dbdd60-0e71-4aa8-a448-d721e28fd76c	PARTICULIER	2500.00	2026-08-17 09:36:04.013+00	2026-08-17 09:36:04.021+00	\N
c0422c27-30bd-421c-927d-c3c845c42297	b9dbdd60-0e71-4aa8-a448-d721e28fd76c	ENTREPRISE	2100.00	2026-08-17 09:36:04.029+00	2026-08-17 09:36:04.035+00	\N
de430f15-3d75-436a-92c6-b93de9fb64c0	ea40a920-4f14-470f-937e-1ee11b4d8106	PARTICULIER	4500.00	2026-08-17 09:36:04.053+00	2026-08-17 09:36:04.057+00	\N
54523736-c669-458c-94ac-958884322054	ea40a920-4f14-470f-937e-1ee11b4d8106	ENTREPRISE	3800.00	2026-08-17 09:36:04.063+00	2026-08-17 09:36:04.068+00	\N
7ae77c5f-25af-4d65-b4e7-3ce7551c1473	b13e7225-dd6b-4d16-ad59-761516c5043d	PARTICULIER	1800.00	2026-08-17 09:36:04.084+00	2026-08-17 09:36:04.088+00	\N
54faa9bd-364a-45af-83fb-7cebf4245aa0	b13e7225-dd6b-4d16-ad59-761516c5043d	ENTREPRISE	1500.00	2026-08-17 09:36:04.093+00	2026-08-17 09:36:04.097+00	\N
a0dd2365-4fee-46e5-9378-5f2ef31a04c6	6d7f1495-4ba1-47e9-a4bf-39e07455827f	PARTICULIER	3500.00	2026-08-17 09:36:04.113+00	2026-08-17 09:36:04.117+00	\N
8183a0cf-44e5-44b2-accc-7c11d9063b2f	6d7f1495-4ba1-47e9-a4bf-39e07455827f	ENTREPRISE	2900.00	2026-08-17 09:36:04.122+00	2026-08-17 09:36:04.126+00	\N
26e935e0-7947-4616-816d-d191cbb69e51	2d7b9c26-1212-4673-af97-a9491f5d99ca	PARTICULIER	25000.00	2026-08-17 09:36:04.141+00	2026-08-17 09:36:04.145+00	\N
f400ba37-fafd-4d50-9773-b66276f58271	2d7b9c26-1212-4673-af97-a9491f5d99ca	ENTREPRISE	21000.00	2026-08-17 09:36:04.15+00	2026-08-17 09:36:04.154+00	\N
5e80eeb4-d85d-4069-aff6-fd14fbb43645	93b3184d-914c-410f-ba8e-db4c4bcf5338	PARTICULIER	6000.00	2026-08-17 09:36:04.169+00	2026-08-17 09:36:04.173+00	\N
bb2fcc19-664e-4d07-8e4a-b01058da0d3a	93b3184d-914c-410f-ba8e-db4c4bcf5338	ENTREPRISE	5000.00	2026-08-17 09:36:04.177+00	2026-08-17 09:36:04.18+00	\N
509275d3-1c49-4695-b297-f2f69ef988b3	e4d37252-1f61-4623-a454-c8da522af4d6	PARTICULIER	2000.00	2026-08-17 09:36:04.195+00	2026-08-17 09:36:04.199+00	\N
b02fc830-07d4-4cbf-bb27-a14289d7f8a6	e4d37252-1f61-4623-a454-c8da522af4d6	ENTREPRISE	1700.00	2026-08-17 09:36:04.205+00	2026-08-17 09:36:04.209+00	\N
1a10ef59-2398-4686-80ac-f89805cf26fb	6d280bba-fe63-42c9-be0d-aabe50c2e6a4	PARTICULIER	8000.00	2026-08-17 09:36:04.228+00	2026-08-17 09:36:04.236+00	\N
440d5ee4-9c0a-4f3b-aaa7-c421c2428470	6d280bba-fe63-42c9-be0d-aabe50c2e6a4	ENTREPRISE	6800.00	2026-08-17 09:36:04.245+00	2026-08-17 09:36:04.254+00	\N
afc60fb1-f1f1-49fe-bcb9-2033f4345650	b423f1af-2854-4ff2-a71c-6ca3195e53bc	PARTICULIER	12000.00	2026-08-17 09:36:04.28+00	2026-08-17 09:36:04.289+00	\N
d3b2d024-4967-45e4-a834-3353193291a2	b423f1af-2854-4ff2-a71c-6ca3195e53bc	ENTREPRISE	10000.00	2026-08-17 09:36:04.298+00	2026-08-17 09:36:04.306+00	\N
d9f2454a-f26d-4b8b-98a3-09edc89205d0	3c3d36e4-a109-4e1e-9b4f-379d447f7aab	PARTICULIER	9000.00	2026-08-17 09:36:04.331+00	2026-08-17 09:36:04.34+00	\N
4119ea40-5cc3-45e8-b249-dabea26cf6d4	3c3d36e4-a109-4e1e-9b4f-379d447f7aab	ENTREPRISE	7500.00	2026-08-17 09:36:04.349+00	2026-08-17 09:36:04.356+00	\N
63c80a3d-a133-48a8-be2d-0662dd82ec9d	ec3d252c-37ac-46e0-baaa-c18b34989eb8	PARTICULIER	42000.00	2026-08-17 09:36:04.497+00	2026-08-17 09:36:04.504+00	\N
5182afae-cdd8-41b0-8d22-938d3517e196	ec3d252c-37ac-46e0-baaa-c18b34989eb8	ENTREPRISE	35000.00	2026-08-17 09:36:04.516+00	2026-08-17 09:36:04.523+00	\N
a8ea45c6-a1bc-4eed-9e9c-e14a600efda3	7170ce4d-09f0-4ba4-b1f6-adc637224cd6	PARTICULIER	55000.00	2026-08-17 09:36:04.548+00	2026-08-17 09:36:04.556+00	\N
8ea175cd-42cb-47b9-ac66-5cc4aa6f2196	7170ce4d-09f0-4ba4-b1f6-adc637224cd6	ENTREPRISE	46000.00	2026-08-17 09:36:04.564+00	2026-08-17 09:36:04.57+00	\N
a93a0813-88fc-4ed1-b572-99c1a652d406	15c352b3-3d99-46e0-8946-be51b6033f0d	PARTICULIER	95000.00	2026-08-17 09:36:04.593+00	2026-08-17 09:36:04.6+00	\N
c9f6aa7d-fee2-4935-89f7-c3fa642d2d7c	15c352b3-3d99-46e0-8946-be51b6033f0d	ENTREPRISE	80000.00	2026-08-17 09:36:04.608+00	2026-08-17 09:36:04.614+00	\N
d1ebcb2c-0377-4b96-932b-38432aa5756c	d67e063f-b2f6-42c6-a637-1987f926a44e	PARTICULIER	5000.00	2026-08-17 09:36:04.637+00	2026-08-17 09:36:04.644+00	\N
a462e9a8-40a0-4d63-b9ca-663b0c526eb1	d67e063f-b2f6-42c6-a637-1987f926a44e	ENTREPRISE	4200.00	2026-08-17 09:36:04.653+00	2026-08-17 09:36:04.659+00	\N
2a4afb6c-0eb9-45bf-8589-e92d4e81cce0	d3713909-7dd3-4420-ad61-f432ec403f95	PARTICULIER	12000.00	2026-08-17 09:36:04.681+00	2026-08-17 09:36:04.688+00	\N
b9975ee8-4b2b-4da0-932a-c44e2b0e99ae	d3713909-7dd3-4420-ad61-f432ec403f95	ENTREPRISE	10000.00	2026-08-17 09:36:04.695+00	2026-08-17 09:36:04.702+00	\N
e292bbee-ef6c-41d7-be4c-6ec4a5fa3602	95900c76-fe8c-4a21-9bc0-d8ff3d3e87dd	PARTICULIER	3500.00	2026-08-17 09:36:04.724+00	2026-08-17 09:36:04.73+00	\N
3f728c1e-9758-472c-b792-299fb703582e	95900c76-fe8c-4a21-9bc0-d8ff3d3e87dd	ENTREPRISE	2900.00	2026-08-17 09:36:04.739+00	2026-08-17 09:36:04.745+00	\N
93d8d194-fd29-41a9-9896-3fb9774c5dfa	33f08068-90b2-45ac-a363-776320ee34b9	PARTICULIER	4000.00	2026-08-17 09:36:04.769+00	2026-08-17 09:36:04.775+00	\N
75419363-59cc-4d67-9619-5c940a976f0f	33f08068-90b2-45ac-a363-776320ee34b9	ENTREPRISE	3300.00	2026-08-17 09:36:04.783+00	2026-08-17 09:36:04.793+00	\N
28d53b5a-0028-4df4-9975-4bbee71a063b	3a8db114-22ac-4794-a4b9-74ec29beff6e	PARTICULIER	8000.00	2026-08-17 09:36:04.815+00	2026-08-17 09:36:04.822+00	\N
9074c932-910f-4aed-a833-d302a0f07058	3a8db114-22ac-4794-a4b9-74ec29beff6e	ENTREPRISE	6800.00	2026-08-17 09:36:04.829+00	2026-08-17 09:36:04.835+00	\N
329a8859-c72a-4477-b0c5-cbfedd7d1298	d97fc8d6-62cc-40cf-a285-2b7c8ff25a9d	PARTICULIER	185000.00	2026-08-17 09:36:04.872+00	2026-08-17 09:36:04.879+00	\N
3b373509-ebf4-491f-a8a9-0f4605c0f52b	d97fc8d6-62cc-40cf-a285-2b7c8ff25a9d	ENTREPRISE	160000.00	2026-08-17 09:36:04.888+00	2026-08-17 09:36:04.893+00	\N
48436440-3d53-494f-a7f9-23ff7f56c62d	fbb230d8-bdfa-472b-9d8a-5d3acb8a5579	PARTICULIER	250000.00	2026-08-17 09:36:04.917+00	2026-08-17 09:36:04.92+00	\N
77c1670d-d77d-4ae7-9e53-ff0e80d870b3	fbb230d8-bdfa-472b-9d8a-5d3acb8a5579	ENTREPRISE	215000.00	2026-08-17 09:36:04.924+00	2026-08-17 09:36:04.927+00	\N
9d278d96-f64c-432a-ae3b-42af14f53384	14620dac-16b2-4062-8dd1-2fdf3022a7f2	PARTICULIER	450000.00	2026-08-17 09:36:04.94+00	2026-08-17 09:36:04.943+00	\N
18a50e9f-ea21-4c2a-a2cf-56359504a491	14620dac-16b2-4062-8dd1-2fdf3022a7f2	ENTREPRISE	390000.00	2026-08-17 09:36:04.947+00	2026-08-17 09:36:04.951+00	\N
f4045560-c67d-4f6c-920e-e397cea41acc	683f985d-4664-4212-aa26-6205c82e4bb0	PARTICULIER	650000.00	2026-08-17 09:36:04.963+00	2026-08-17 09:36:04.967+00	\N
c15e6da3-03de-41b8-9d14-28979a62325a	683f985d-4664-4212-aa26-6205c82e4bb0	ENTREPRISE	560000.00	2026-08-17 09:36:04.971+00	2026-08-17 09:36:04.975+00	\N
5c6ba5b8-0699-4c83-ae2c-501dbb5e2f9c	8f43ce88-3f6d-4df7-8306-1cb4de252357	PARTICULIER	850000.00	2026-08-17 09:36:04.986+00	2026-08-17 09:36:04.99+00	\N
68193910-67bf-4fce-8403-cb5d75efea1d	8f43ce88-3f6d-4df7-8306-1cb4de252357	ENTREPRISE	730000.00	2026-08-17 09:36:04.994+00	2026-08-17 09:36:04.997+00	\N
cbdf1d20-5513-4dfe-b0dd-ccccb85957bd	57a828e8-d90a-44e2-a02b-9d18b9b7f901	PARTICULIER	1200000.00	2026-08-17 09:36:05.009+00	2026-08-17 09:36:05.012+00	\N
faa89ee2-ec16-46e4-940b-9011ae46ae5b	57a828e8-d90a-44e2-a02b-9d18b9b7f901	ENTREPRISE	1050000.00	2026-08-17 09:36:05.015+00	2026-08-17 09:36:05.019+00	\N
89469e7d-b37f-4e99-9a2a-7ef73b9c8eb4	3258b44b-5b68-4e5d-9ac4-4ab4cc18031d	PARTICULIER	1600000.00	2026-08-17 09:36:05.03+00	2026-08-17 09:36:05.034+00	\N
5764ab7e-2efb-4943-b9e1-2176d13d79da	3258b44b-5b68-4e5d-9ac4-4ab4cc18031d	ENTREPRISE	1400000.00	2026-08-17 09:36:05.038+00	2026-08-17 09:36:05.042+00	\N
8bf4fd19-a287-4bce-89c9-67a3417bb964	091d3454-76d9-43b9-a640-6f1019c83f2e	PARTICULIER	2500000.00	2026-08-17 09:36:05.054+00	2026-08-17 09:36:05.057+00	\N
72662a84-48cf-431b-af23-aa20d75149cc	091d3454-76d9-43b9-a640-6f1019c83f2e	ENTREPRISE	2200000.00	2026-08-17 09:36:05.061+00	2026-08-17 09:36:05.064+00	\N
b953723e-8304-4e89-904e-1185cee78aae	43088269-7b8c-45de-9005-4c4a3d6a07ac	PARTICULIER	12000.00	2026-08-17 09:36:05.08+00	2026-08-17 09:36:05.083+00	\N
e8d260a4-992a-4abe-9e1b-1bcadf6ce83a	43088269-7b8c-45de-9005-4c4a3d6a07ac	ENTREPRISE	10000.00	2026-08-17 09:36:05.087+00	2026-08-17 09:36:05.09+00	\N
d08b2156-0eb1-4071-adaa-c7474868ecfd	b45e83cf-c63c-4082-8fbb-f1ed21ac92a6	PARTICULIER	18000.00	2026-08-17 09:36:05.103+00	2026-08-17 09:36:05.106+00	\N
3f8d0fc1-3952-447e-b282-322875a5532b	b45e83cf-c63c-4082-8fbb-f1ed21ac92a6	ENTREPRISE	15000.00	2026-08-17 09:36:05.11+00	2026-08-17 09:36:05.114+00	\N
be0c5856-3560-4f99-8144-00f376a5066f	77505776-790d-4c68-92b8-211bce55971e	PARTICULIER	25000.00	2026-08-17 09:36:05.128+00	2026-08-17 09:36:05.134+00	\N
c7374026-b2c7-4104-bce0-a86f728c8851	77505776-790d-4c68-92b8-211bce55971e	ENTREPRISE	21000.00	2026-08-17 09:36:05.141+00	2026-08-17 09:36:05.145+00	\N
ee96ed9b-ab41-4506-835b-6ba49b266a00	d0ce3a32-fbe2-436a-abab-d8db0d5190cd	PARTICULIER	1500.00	2026-08-17 09:36:05.159+00	2026-08-17 09:36:05.162+00	\N
eee3bc64-9d80-455a-afa8-72bd6394f03c	d0ce3a32-fbe2-436a-abab-d8db0d5190cd	ENTREPRISE	1200.00	2026-08-17 09:36:05.168+00	2026-08-17 09:36:05.171+00	\N
ed6c90c6-4b55-4d48-9435-7ae0234322e3	6eb0a5ef-b0cf-4a95-baf2-0808197b740b	PARTICULIER	2500.00	2026-08-17 09:36:05.186+00	2026-08-17 09:36:05.19+00	\N
c5e385c0-d1a4-4ad8-9e93-cf2e09224558	6eb0a5ef-b0cf-4a95-baf2-0808197b740b	ENTREPRISE	2100.00	2026-08-17 09:36:05.194+00	2026-08-17 09:36:05.197+00	\N
651cba4f-8d62-49a4-aacd-56edbbe32387	6792db60-4242-40df-b2b1-853ece9cbd55	PARTICULIER	4000.00	2026-08-17 09:36:05.21+00	2026-08-17 09:36:05.213+00	\N
e8d5f415-59d3-4e01-858c-41a6a9b8bf84	6792db60-4242-40df-b2b1-853ece9cbd55	ENTREPRISE	3400.00	2026-08-17 09:36:05.218+00	2026-08-17 09:36:05.221+00	\N
2c7f2113-139a-42d3-a6fa-7e8269e4d017	3af6050b-0ef6-48f1-a873-d0366324c941	PARTICULIER	6000.00	2026-08-17 09:36:05.232+00	2026-08-17 09:36:05.236+00	\N
b57e7698-b379-4e6b-bf4d-6a8cc208a4a0	3af6050b-0ef6-48f1-a873-d0366324c941	ENTREPRISE	5000.00	2026-08-17 09:36:05.239+00	2026-08-17 09:36:05.242+00	\N
d1768120-d827-4712-a2db-1873233886cc	c7d3bc70-3ac5-483e-8a20-5e62cf70001d	PARTICULIER	8000.00	2026-08-17 09:36:05.256+00	2026-08-17 09:36:05.259+00	\N
9c8f9b5c-0984-453d-aa61-e2dfeed1e10e	c7d3bc70-3ac5-483e-8a20-5e62cf70001d	ENTREPRISE	6800.00	2026-08-17 09:36:05.262+00	2026-08-17 09:36:05.265+00	\N
8f6bdd9f-73e9-4e16-8a68-a89dbf36ab45	5c4c8f45-9c8e-4d17-accf-29da3d4ae5ea	PARTICULIER	3500.00	2026-08-17 09:36:05.276+00	2026-08-17 09:36:05.279+00	\N
92b63e05-9520-4ea9-b0f8-71db6d2551bd	5c4c8f45-9c8e-4d17-accf-29da3d4ae5ea	ENTREPRISE	2900.00	2026-08-17 09:36:05.283+00	2026-08-17 09:36:05.287+00	\N
d869707b-9f86-42f6-8e44-9e86b52c73d7	e60b7279-7b24-4e4f-a16e-8e2a60741801	PARTICULIER	5000.00	2026-08-17 09:36:05.297+00	2026-08-17 09:36:05.302+00	\N
9751942b-74f3-4167-ad69-d2ea6f4eebd8	e60b7279-7b24-4e4f-a16e-8e2a60741801	ENTREPRISE	4200.00	2026-08-17 09:36:05.305+00	2026-08-17 09:36:05.308+00	\N
547947c9-6eb0-4ff2-807e-dae01dafa6f9	50c60692-9256-4890-b2e6-a06022cfe1c1	PARTICULIER	35000.00	2026-08-17 09:36:05.325+00	2026-08-17 09:36:05.328+00	\N
e1c4d2ac-f9a7-412b-9779-a422fa1cbd3a	50c60692-9256-4890-b2e6-a06022cfe1c1	ENTREPRISE	29000.00	2026-08-17 09:36:05.331+00	2026-08-17 09:36:05.336+00	\N
8328f02b-e015-4c5a-ad48-871785428338	a493f297-5b1e-4d70-ab5c-5e4765c91443	PARTICULIER	28000.00	2026-08-17 09:36:05.346+00	2026-08-17 09:36:05.349+00	\N
72d5eb06-d97a-4a07-a535-4a2034e34b2e	a493f297-5b1e-4d70-ab5c-5e4765c91443	ENTREPRISE	24000.00	2026-08-17 09:36:05.353+00	2026-08-17 09:36:05.357+00	\N
84685ed5-a808-4b7c-91cc-24aa2845a7b9	a1133c0f-3d85-4362-8e80-5215f8ab8d8d	PARTICULIER	15000.00	2026-08-17 09:36:05.369+00	2026-08-17 09:36:05.372+00	\N
c09ead37-2969-4d4d-a465-3bf0a207714f	a1133c0f-3d85-4362-8e80-5215f8ab8d8d	ENTREPRISE	12500.00	2026-08-17 09:36:05.376+00	2026-08-17 09:36:05.379+00	\N
52f67923-0aec-4f5f-92ef-7b2d1d4aa555	527116ce-d9a7-4479-9e25-1b8dfa046ea0	PARTICULIER	20000.00	2026-08-17 09:36:05.394+00	2026-08-17 09:36:05.398+00	\N
4d93965b-5366-44f7-a842-4b5b60c10f9d	527116ce-d9a7-4479-9e25-1b8dfa046ea0	ENTREPRISE	17000.00	2026-08-17 09:36:05.404+00	2026-08-17 09:36:05.409+00	\N
2ec30141-86ab-4c32-a63f-339d599ae744	b4cc8ca0-0814-4c5a-9af9-530aa72da701	PARTICULIER	3000.00	2026-08-17 09:36:05.424+00	2026-08-17 09:36:05.428+00	\N
353c32d4-05a6-4b42-ada8-eedb88d29931	b4cc8ca0-0814-4c5a-9af9-530aa72da701	ENTREPRISE	2500.00	2026-08-17 09:36:05.433+00	2026-08-17 09:36:05.439+00	\N
1064a4c7-57b6-4bcf-9d22-70ee40662279	fd00f75c-3124-4237-a15e-62a3b483b0ac	PARTICULIER	2000.00	2026-08-17 09:36:05.455+00	2026-08-17 09:36:05.459+00	\N
fa7efdc2-e3f2-4348-a787-ea42af63df6f	fd00f75c-3124-4237-a15e-62a3b483b0ac	ENTREPRISE	1700.00	2026-08-17 09:36:05.464+00	2026-08-17 09:36:05.469+00	\N
86ce4653-d378-4e3b-ab61-413ffd496448	a01aaf44-8049-43c4-8761-2a82028eeec1	PARTICULIER	6500.00	2026-08-17 09:36:05.495+00	2026-08-17 09:36:05.5+00	\N
c83fd00c-dd8b-4631-892d-e09a3ac7358f	a01aaf44-8049-43c4-8761-2a82028eeec1	ENTREPRISE	5900.00	2026-08-17 09:36:05.505+00	2026-08-17 09:36:05.509+00	\N
0359b92f-3178-4e93-ac2c-a6da15555bd0	e00da07f-19e4-4f6b-a728-fdcaecf40829	PARTICULIER	4500.00	2026-08-17 09:36:05.525+00	2026-08-17 09:36:05.528+00	\N
f47cf193-c496-4279-b85c-c4534f96c3e2	e00da07f-19e4-4f6b-a728-fdcaecf40829	ENTREPRISE	3900.00	2026-08-17 09:36:05.531+00	2026-08-17 09:36:05.535+00	\N
fa9ea621-efeb-487a-9409-0c95166dede4	1197bd79-9786-403b-b52b-40385ea4f53c	PARTICULIER	7000.00	2026-08-17 09:36:05.544+00	2026-08-17 09:36:05.547+00	\N
bcf8ba52-9d53-47c1-9c33-54cfd9b792bc	1197bd79-9786-403b-b52b-40385ea4f53c	ENTREPRISE	6100.00	2026-08-17 09:36:05.551+00	2026-08-17 09:36:05.554+00	\N
58d797ad-a933-4730-a4c9-ff2c035bec75	ca9b27d6-ada5-4be7-b9d7-698ef888d353	PARTICULIER	10000.00	2026-08-17 09:36:05.564+00	2026-08-17 09:36:05.568+00	\N
40ae241d-2620-47b1-b5d3-b478bade135a	ca9b27d6-ada5-4be7-b9d7-698ef888d353	ENTREPRISE	8700.00	2026-08-17 09:36:05.572+00	2026-08-17 09:36:05.575+00	\N
0103293e-cf4a-4668-87d5-5141b6b787b8	45c8ff2d-f246-4ce6-a1bd-e9d3b872ac4e	PARTICULIER	25000.00	2026-08-17 09:36:05.586+00	2026-08-17 09:36:05.589+00	\N
48d4bc83-7bd5-4fe0-9289-6d4e7b02c4e6	45c8ff2d-f246-4ce6-a1bd-e9d3b872ac4e	ENTREPRISE	22000.00	2026-08-17 09:36:05.593+00	2026-08-17 09:36:05.595+00	\N
455ee0b1-32e9-4f70-8097-7f5d6b46da4e	c07e0e5e-c3b1-472d-b7b1-5cbbd4888f0f	PARTICULIER	30000.00	2026-08-17 09:36:05.606+00	2026-08-17 09:36:05.609+00	\N
51c0b56f-f121-44c1-88b4-d5c4259a5d0d	c07e0e5e-c3b1-472d-b7b1-5cbbd4888f0f	ENTREPRISE	26000.00	2026-08-17 09:36:05.613+00	2026-08-17 09:36:05.617+00	\N
1a541b34-1e73-43ad-a35d-22dab8e195f6	23ea8071-f2c7-493a-9158-18e73b5d2b1e	PARTICULIER	800.00	2026-08-17 09:36:05.629+00	2026-08-17 09:36:05.634+00	\N
5b73ecd5-a739-4292-b19a-626d0425b60b	23ea8071-f2c7-493a-9158-18e73b5d2b1e	ENTREPRISE	700.00	2026-08-17 09:36:05.638+00	2026-08-17 09:36:05.642+00	\N
5e70feae-7f1f-4765-81d8-b0bca9e32e5d	6cf02f55-bc03-4928-9b0b-3b07d24691cd	PARTICULIER	12000.00	2026-08-17 09:36:05.654+00	2026-08-17 09:36:05.658+00	\N
3bf83aca-8e13-4643-9c7c-97618be2d8ad	6cf02f55-bc03-4928-9b0b-3b07d24691cd	ENTREPRISE	10500.00	2026-08-17 09:36:05.662+00	2026-08-17 09:36:05.666+00	\N
ef54a907-73dc-451b-b8b1-2d4851f8e299	c91be8ed-514f-492f-a863-5db0eec9901e	ENTREPRISE_CLIENT	2929.00	2026-08-17 15:24:03.357+00	2026-08-17 15:24:03.357+00	\N
\.


--
-- Data for Name: utilisateurs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.utilisateurs (id, email, telephone, mot_de_passe_hash, role, est_actif, derniere_connexion_au, cree_le, mis_a_jour_le, avatar_url) FROM stdin;
1b1d0c59-982a-4ffc-8bbb-9d73878fa642	admin@gmail.com	0700000002	$2b$12$IG2klGSxYNzvh8vN9TOj0udLctcayo6Bc5x7NUKtDrIF4OFhzkhmy	ADMIN	t	2026-08-22 11:30:26.153+00	2026-08-13 08:40:10.938+00	2026-08-22 11:30:26.153+00	/uploads/avatars/avatar-1b1d0c59-1787215348756.jfif
5f1f291d-0fad-494b-bffb-9af5b9e14732	sorhodavid31@gmail.com	0584278638	$2b$12$j4Pwb09J.0nR.OXA9C.Da.Xil23/MUs9CSBQjUYhy//BsCDf1sM6a	CLIENT	t	2026-08-23 19:48:01.608+00	2026-08-13 13:45:39.623+00	2026-08-23 19:48:01.609+00	/uploads/avatars/avatar-5f1f291d-1787047216788.jpeg
44772e8b-0513-4046-b94a-dd60d14b7c89	sucaf@gmail.com	070000003	$2b$12$8LdQT.IA6f58lhVoaGHO/ex4OoGYxkZmn8SP4F6a9J3.5Pt16UD22	CLIENT	t	2026-08-20 11:44:55.8+00	2026-08-18 10:02:06.021+00	2026-08-20 17:05:56.602+00	\N
3bfb915a-ac0c-45bb-b02e-20a28a5e57ed	client@soutarah.local	0700000001	$2b$12$S0Jc83t2GxgWNed1qgJALeXcS1Koatdvpd9kLpmDE5rY6C/BJPpSm	CLIENT	t	2026-08-21 17:30:44.301+00	2026-08-13 08:40:10.369+00	2026-08-21 17:30:44.302+00	/uploads/avatars/avatar-3bfb915a-1786967676084.png
\.


--
-- Data for Name: vehicule_prix_entreprises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicule_prix_entreprises (id, vehicule_id, entreprise_id, prix_journalier, cree_le, mis_a_jour_le) FROM stdin;
\.


--
-- Data for Name: vehicules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicules (id, marque, modele, categorie, description, image_url, places, carburant, transmission, prix_journalier_particulier, prix_journalier_entreprise, disponibilite, statut, cree_le, mis_a_jour_le, prix_journalier_entreprise_client) FROM stdin;
700e8fb8-d963-4da1-8b37-4bc49d3320ca	Ford	Transit	Utilitaires	10 places assises • Manuel • Assurée	/img/vehicles/ford1.jpg	10	Essence	Manuel	40000.00	40000.00	t	ACTIVE	2026-08-14 11:06:55.275+00	2026-08-22 11:25:44.817+00	40000.00
a5299f86-ec20-40d1-9c1e-f53ba3c72071	Ford	Transit 9 Places	Minibus	9 places assises • Manuel • Avec chauffeur	/img/vehicles/ford1.jpg	9	Essence	Manuel	70000.00	70000.00	t	ACTIVE	2026-08-14 11:06:55.363+00	2026-08-22 11:25:44.823+00	70000.00
44772273-cfec-45c7-b046-d9a2db1a4081	Nissan	Urvan	Minibus	15 places assises • Automatique • Assurée	/img/vehicles/urvan1.jpeg	15	Essence	Automatique	70000.00	70000.00	t	ACTIVE	2026-08-14 11:06:55.283+00	2026-08-22 11:25:44.835+00	70000.00
1085a956-2c2c-4fd7-8ee5-66e20437fd61	Renault	Dokker	Utilitaires	5 personnes • Manuel • Assurée	/img/vehicles/dokker.jpg	5	Essence	Manuel	30000.00	30000.00	t	ACTIVE	2026-08-14 11:06:55.152+00	2026-08-22 11:25:44.745+00	30000.00
16f55399-fc68-48b8-a27a-89ec562f63a9	Toyota	Tacoma	Pick-Up	5 personnes • Automatique • Assurée	/img/vehicles/tacomaav.jpeg	5	Essence	Automatique	50000.00	50000.00	t	ACTIVE	2026-08-14 11:06:55.243+00	2026-08-22 11:25:44.796+00	50000.00
f760ff7d-e498-448f-8e4d-3fdcfa9a0dc4	Renault	Van Express	Utilitaires	2 places assises • Manuel • Assurée	/img/vehicles/express1.jpeg	2	Essence	Manuel	30000.00	30000.00	t	ACTIVE	2026-08-14 11:06:55.267+00	2026-08-22 11:25:44.803+00	30000.00
a7243db8-091b-4bfc-9c1c-891b656ea818	Citroën	Jumper	Utilitaires	3 places assises • Automatique • Assurée	/img/vehicles/jumperav.jpeg	3	Essence	Automatique	30000.00	30000.00	t	ACTIVE	2026-08-14 11:06:55.107+00	2026-08-22 11:25:44.81+00	30000.00
93537fa3-c6e5-49e0-9b97-ee60951f563b	Renault	OROCH	Pick-Up	5 personnes • Manuel • Assurée	/img/vehicles/orochav.jpeg	5	Essence	Manuel	30000.00	30000.00	t	ACTIVE	2026-08-14 11:06:55.096+00	2026-08-22 11:13:41.409+00	30000.00
c824040f-2b62-4d16-a37c-66e64cdcd1d8	Suzuki	Vitara Rouge	SUV	5 personnes • Automatique • Assurée	/img/vehicles/vitaraAvant.jpg	5	Essence	Automatique	35000.00	35000.00	t	ACTIVE	2026-08-14 11:06:55.226+00	2026-08-22 11:13:41.416+00	35000.00
d1ede849-04b3-4adf-82ac-2c703f4f3816	Suzuki	Grand Vitara 932	SUV	5 personnes • Automatique • Assurée	/img/vehicles/gvitaraAv.jpeg	5	Essence	Automatique	40501.00	40501.00	t	ACTIVE	2026-08-14 11:06:55.191+00	2026-08-22 11:13:41.422+00	40501.00
d093792b-3c95-40d3-8958-19f075539692	Mitsubishi	Pajero 13	4x4	7 personnes • Automatique • Assurée	/img/vehicles/pajeroav.jpeg	7	Essence	Automatique	55000.00	55000.00	t	ACTIVE	2026-08-14 11:06:55.131+00	2026-08-22 11:13:41.434+00	5000.00
b56cdb60-84f1-4e80-8303-f2772ca61664	Toyota	Land Cruiser	Luxe	7 personnes • Automatique • Assurée	/img/vehicles/l300.jpeg	7	Essence	Automatique	190000.00	190000.00	t	ACTIVE	2026-08-14 11:06:55.171+00	2026-08-22 11:13:41.444+00	190000.00
d6aa2dbf-24d2-4128-b82c-fe6abfff0a3e	Hyundai	32 Places	Autocar	32 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	32	Essence	Manuel	135000.00	135000.00	t	ACTIVE	2026-08-14 11:06:55.421+00	2026-08-22 11:13:41.462+00	135000.00
b654e4f9-1e03-4f8b-9bb3-29c2a79cf355	Renault	Koleos	SUV	5 personnes • Automatique • Assurée	/img/vehicles/koleosAv.jpeg	5	Essence	Automatique	40500.00	40500.00	t	ACTIVE	2026-08-14 11:06:55.119+00	2026-08-22 11:13:41.484+00	40500.00
89fba576-be5a-4ada-8595-6f2afd0d77e3	Isuzu	D-Max New	Pick-Up	5 personnes • Manuel • Assurée	/img/vehicles/dmaxav.png	5	Essence	Manuel	55000.00	55000.00	t	ACTIVE	2026-08-14 11:06:55.316+00	2026-08-22 11:13:41.489+00	55000.00
5307920d-69fa-4d19-ae7b-bc410206018f	Mitsubishi	L200	Pick-Up	5 personnes • Manuel • Assurée	/img/vehicles/l200av.jpg	5	Essence	Manuel	51000.00	51000.00	t	ACTIVE	2026-08-14 11:06:55.26+00	2026-08-22 11:13:41.494+00	51000.00
f039666b-aa48-4a6d-a07c-80522c62216d	Mitsubishi	Pajero 48	4x4	4 personnes • Automatique • Assurée	/img/vehicles/pajeroav.jpeg	4	Essence	Automatique	50000.00	50000.00	t	ACTIVE	2026-08-14 11:06:55.143+00	2026-08-22 11:13:41.439+00	5000.00
caf1e9a8-b4e2-4950-a11f-cea645610cd7	Renault	Kadjar	SUV	5 personnes • Automatique • Assurée	/img/vehicles/kadjaravant.jpeg	5	Essence	Automatique	40541.00	40541.00	t	ACTIVE	2026-08-14 11:06:55.199+00	2026-08-22 11:13:41.511+00	40541.00
4746a084-4fbd-48e7-8ff8-96f7b6f125aa	Suzuki	Grand Vitara 755	SUV	5 personnes • Automatique • Assurée	/img/vehicles/ngvitaraav.jpeg	5	Essence	Automatique	40541.00	40541.00	t	ACTIVE	2026-08-14 11:06:55.251+00	2026-08-22 11:13:41.515+00	40541.00
57f4f0d3-5d43-4b1b-b9ea-7cf5613b51ad	Toyota	Highlander	4x4	7 personnes • Automatique • Assurée	/img/vehicles/high.jpeg	7	Essence	Automatique	55000.00	55000.00	t	ACTIVE	2026-08-14 11:06:55.217+00	2026-08-22 11:13:41.52+00	55000.00
68bc145a-3cd3-47e4-be33-607ecd987989	Renault	Duster	Citadines	5 personnes • Automatique • Assurée	/img/vehicles/dusterAvant.jpg	5	Essence	Automatique	30000.00	30000.00	t	ACTIVE	2026-08-14 11:06:55.042+00	2026-08-22 11:13:41.475+00	30000.00
c13157ae-e0aa-4ff0-bf4e-f2f6eb342a8c	Toyota	Fortuner	Luxe	7 personnes • Automatique • Assurée	/img/vehicles/fortuner.jpg	7	Essence	Automatique	113739.00	113739.00	t	ACTIVE	2026-08-14 11:06:55.348+00	2026-08-22 11:13:41.498+00	113739.00
1389f6f9-ab22-49a3-8d6e-c3424e7f08f8	Isuzu	D-Max	Pick-Up	5 personnes • Manuel • Assurée	/img/vehicles/dmaxav.png	5	Essence	Manuel	55000.00	55000.00	t	ACTIVE	2026-08-14 11:06:55.293+00	2026-08-22 11:13:41.502+00	55000.00
4609e2c7-efc9-4f01-b86f-c1546939494d	Nissan	Kicks	SUV	5 personnes • Automatique • Assurée	/img/vehicles/KickAvant.jpeg	5	Essence	Automatique	40500.00	40500.00	t	ACTIVE	2026-08-14 11:06:55.182+00	2026-08-22 11:13:41.507+00	40500.00
fa594ce1-d714-4fee-895f-4f3c10cad2fa	Nissan	X-Trail	SUV	5 personnes • Automatique • Assurée	/img/vehicles/nissan_xtrail.jpg	5	Essence	Automatique	46000.00	46000.00	t	ACTIVE	2026-08-20 10:43:56.087+00	2026-08-22 11:13:41.53+00	\N
746ed7ab-a041-4d0f-959c-69de9648f3b6	Kia	Picanto	Citadines	5 personnes • Automatique • Assurée	/img/vehicles/kia_picanto.jpg	5	Essence	Automatique	17000.00	17000.00	t	ACTIVE	2026-08-20 10:43:55.983+00	2026-08-22 11:13:41.534+00	\N
8a6ea387-baf7-4a21-be5c-4d94e3ef7948	Hyundai	Accent	Citadines	5 personnes • Automatique • Assurée	/img/vehicles/hyundai_accent.jpg	5	Essence	Automatique	24000.00	24000.00	t	ACTIVE	2026-08-20 10:43:56.008+00	2026-08-22 11:13:41.539+00	\N
830abfd1-ca69-4b76-9cfe-419c30cb486b	Hyundai	i10	Citadines	5 personnes • Manuel • Assurée	/img/vehicles/hyundai_i10.jpg	5	Essence	Manuel	18000.00	18000.00	t	ACTIVE	2026-08-20 10:43:55.976+00	2026-08-22 11:13:41.544+00	\N
c4e21a5a-19b6-4153-aecd-50e26c749022	Toyota	Land Cruiser Prado	4x4	7 personnes • Automatique • Assurée	/img/vehicles/prado.jpg	7	Essence	Automatique	120000.00	120000.00	t	ACTIVE	2026-08-20 10:43:56.101+00	2026-08-22 11:25:20.444+00	\N
fff31fcd-2f8a-4cee-a9b2-069d2a6ed429	GWM	P-Series	Pick-Up	5 personnes • Manuel • Assurée	/img/vehicles/toyota_hilux.jpg	5	Essence	Manuel	50000.00	50000.00	t	ACTIVE	2026-08-20 10:43:56.184+00	2026-08-22 11:25:20.448+00	\N
93ff833e-dd61-4f12-9129-14b5ec676b4b	Peugeot	3008	SUV	5 personnes • Automatique • Assurée	/img/vehicles/peugeot_3008.jpg	5	Essence	Automatique	44000.00	44000.00	t	ACTIVE	2026-08-20 10:43:56.067+00	2026-08-22 11:13:41.549+00	\N
ac470593-2189-4301-9cd9-49bfd93cb65e	Mitsubishi	Montero	4x4	5 personnes • Automatique • Assurée	/img/vehicles/monteraav.jpeg	5	Essence	Automatique	50000.00	50000.00	t	ACTIVE	2026-08-14 11:06:55.208+00	2026-08-22 11:13:41.552+00	50000.00
55610d52-f970-4880-8d62-ed1074042aca	Nissan	Patrol	4x4	7 personnes • Automatique • Assurée	/img/vehicles/nissan_patrol.jpg	7	Essence	Automatique	110000.00	110000.00	t	ACTIVE	2026-08-20 10:43:56.106+00	2026-08-22 11:13:41.556+00	\N
6e83971b-4f8c-4a18-a617-595e3fd291b8	Suzuki	Grand Vitara New	SUV	5 personnes • Automatique • Assurée	/img/vehicles/ngvitaraav.jpeg	5	Essence	Automatique	40541.00	40541.00	t	ACTIVE	2026-08-14 11:06:55.339+00	2026-08-22 11:13:41.563+00	40541.00
cc45e91f-069d-41c0-ab93-9625341888d4	Isuzu	D-Max 2024	Pick-Up	5 personnes • Manuel • Assurée	/img/vehicles/dmaxav.png	5	Essence	Manuel	56000.00	56000.00	t	ACTIVE	2026-08-20 10:43:56.177+00	2026-08-22 11:13:41.566+00	\N
5a61ad1a-4daa-4b14-b316-57b5d5a4c170	Mazda	CX-5	SUV	5 personnes • Automatique • Assurée	/img/vehicles/mazda_cx5.jpg	5	Essence	Automatique	47000.00	47000.00	t	ACTIVE	2026-08-20 10:43:56.059+00	2026-08-22 11:13:41.571+00	\N
620ac8a9-2a7f-4f56-9ad2-1c0254a1f9cb	Honda	CR-V	SUV	5 personnes • Automatique • Assurée	/img/vehicles/honda_crv.jpg	5	Essence	Automatique	48000.00	48000.00	t	ACTIVE	2026-08-20 10:43:56.038+00	2026-08-22 11:13:41.573+00	\N
b2d1a840-5d09-41e2-875f-0fed0f9d6d86	Ford	Ranger	Pick-Up	5 personnes • Manuel • Assurée	/img/vehicles/ford_ranger.jpg	5	Essence	Manuel	60000.00	60000.00	t	ACTIVE	2026-08-20 10:43:56.161+00	2026-08-22 11:13:41.576+00	\N
454133d2-8ae4-4ca1-82e2-46ec124fef32	Kia	Rio	Citadines	5 personnes • Automatique • Assurée	/img/vehicles/kia_rio.jpg	5	Essence	Automatique	25000.00	25000.00	t	ACTIVE	2026-08-20 10:43:56.014+00	2026-08-22 11:13:41.584+00	\N
bb2e2a17-a780-4c0d-a6ab-be8c7949859f	Suzuki	Dzire	Citadines	5 personnes • Automatique • Assurée	/img/vehicles/dzer.jpg	5	Essence	Automatique	25000.00	25000.00	t	ACTIVE	2026-08-14 11:06:55.163+00	2026-08-22 11:13:41.587+00	25000.00
7f438f4d-4c44-4a76-8261-dd3bef656728	Toyota	RAV4	SUV	5 personnes • Automatique • Assurée	/img/vehicles/rav4avant.jpeg	5	Essence	Automatique	45000.00	45000.00	t	ACTIVE	2026-08-20 10:43:56.033+00	2026-08-22 11:13:41.589+00	\N
dc81dfe0-f41a-454c-8ea8-deb2fd486441	Dacia	Logan	Citadines	5 personnes • Manuel • Assurée	/img/vehicles/dacia_logan.jpg	5	Essence	Manuel	19000.00	19000.00	t	ACTIVE	2026-08-20 10:43:56.027+00	2026-08-22 11:13:41.59+00	\N
acab5c3c-25ca-4dcb-b024-a40298ad7167	Renault	Clio	Citadines	5 personnes • Manuel • Assurée	/img/vehicles/renault_clio.jpg	5	Essence	Manuel	21000.00	21000.00	t	ACTIVE	2026-08-20 10:43:55.997+00	2026-08-22 11:13:41.524+00	\N
ed74e06d-05cd-4dee-bbd8-59bf181a41b3	Ford	Escape	SUV	5 personnes • Automatique • Assurée	/img/vehicles/ford_escape.jpg	5	Essence	Automatique	45000.00	45000.00	t	ACTIVE	2026-08-20 10:43:56.082+00	2026-08-22 11:13:41.561+00	\N
d5d7131e-e798-40c8-8f66-0d49eda25f05	Volkswagen	Tiguan	SUV	5 personnes • Automatique • Assurée	/img/vehicles/vw_tiguan.jpg	5	Essence	Automatique	46000.00	46000.00	t	ACTIVE	2026-08-20 10:43:56.073+00	2026-08-22 11:13:41.569+00	\N
db851e6e-a83b-416a-841a-bf138ef789f5	Toyota	Hilux 4x4	4x4	5 personnes • Manuel • Assurée	/img/vehicles/toyota_hilux.jpg	5	Essence	Manuel	60000.00	60000.00	t	ACTIVE	2026-08-20 10:43:56.125+00	2026-08-22 11:13:41.578+00	\N
f09193db-76a2-4e80-aa38-45a2e721e18d	Toyota	Rush	4x4	7 personnes • Automatique • Assurée	/img/vehicles/rushavant.jpeg	7	Essence	Automatique	50000.00	50000.00	t	ACTIVE	2026-08-14 11:06:55.235+00	2026-08-22 11:13:41.58+00	50000.00
c07289c4-d708-4ecb-b308-68dfd68f3a1f	Chevrolet	Spark	Citadines	5 personnes • Manuel • Assurée	/img/vehicles/chevrolet_spark.jpg	5	Essence	Manuel	16000.00	16000.00	t	ACTIVE	2026-08-20 10:43:56.02+00	2026-08-22 11:13:41.592+00	\N
114f029e-1447-4831-b8d1-4a3c164ab47c	Land	Rover Discovery	4x4	7 personnes • Automatique • Assurée	/img/vehicles/land_rover_discovery.jpg	7	Essence	Automatique	130000.00	130000.00	t	ACTIVE	2026-08-20 10:43:56.12+00	2026-08-22 11:13:41.594+00	\N
2df23098-048b-4e06-a3fb-fb36d4f57b3c	Foton	Tunland	Pick-Up	5 personnes • Manuel • Assurée	/img/vehicles/toyota_hilux.jpg	5	Essence	Manuel	50000.00	50000.00	t	ACTIVE	2026-08-20 10:43:56.21+00	2026-08-22 11:25:20.48+00	\N
04fce10d-e478-4e56-b125-4d8d67219b5b	Iveco	Daily	Utilitaires	10 places assises • Manuel • Assurée	/img/vehicles/ford1.jpg	10	Essence	Manuel	45000.00	45000.00	t	ACTIVE	2026-08-20 10:43:56.239+00	2026-08-22 11:25:20.483+00	\N
5e2da444-9dc9-4db3-9fbd-50268f5d0dcd	Ford	Transit 16 Places	Minibus	16 places assises • Manuel • Avec chauffeur	/img/vehicles/ford1.jpg	16	Essence	Manuel	85000.00	85000.00	t	ACTIVE	2026-08-20 10:43:56.268+00	2026-08-22 11:25:44.828+00	\N
0c67cb5e-9b4b-4164-b6b9-db7673c71e4c	Mercedes	Sprinter	Utilitaires	10 places assises • Manuel • Assurée	/img/vehicles/mercedes_sprinter.jpg	10	Essence	Manuel	50000.00	50000.00	t	ACTIVE	2026-08-20 10:43:56.235+00	2026-08-22 11:25:44.848+00	\N
c4729a28-f056-44c2-8cf9-853f23d05879	Hyundai	50 Places	Autocar	50 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	50	Essence	Manuel	170000.00	170000.00	t	ACTIVE	2026-08-20 10:43:56.32+00	2026-08-22 11:25:20.454+00	\N
a10104e9-ffb9-454a-bd2e-5ca5f38e0d27	Higer	A30	Autocar	50 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	50	Essence	Manuel	165000.00	165000.00	t	ACTIVE	2026-08-20 10:43:56.352+00	2026-08-22 11:25:20.457+00	\N
5b9c986d-aa03-47b6-8feb-3ff9fbcbf468	Renault	Trafic 9 Places	Minibus	9 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	9	Essence	Manuel	65000.00	65000.00	t	ACTIVE	2026-08-20 10:43:56.289+00	2026-08-22 11:25:20.461+00	\N
370fabcf-893f-49a2-9458-ed39b1c56e6d	JAC	T8	Pick-Up	5 personnes • Manuel • Assurée	/img/vehicles/toyota_hilux.jpg	5	Essence	Manuel	52000.00	52000.00	t	ACTIVE	2026-08-20 10:43:56.206+00	2026-08-22 11:25:20.465+00	\N
cfaa1cfc-a425-4042-ad44-70e84782ec6f	Toyota	Hiace Van	Utilitaires	10 places assises • Manuel • Assurée	/img/vehicles/h1ec.jpg	10	Essence	Manuel	35000.00	35000.00	t	ACTIVE	2026-08-20 10:43:56.256+00	2026-08-22 11:25:20.467+00	\N
66e5b302-956d-46cc-a703-7439e24375f8	Mercedes	Tourismo	Autocar	50 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	50	Essence	Manuel	200000.00	200000.00	t	ACTIVE	2026-08-20 10:43:56.324+00	2026-08-22 11:25:20.47+00	\N
cd6d73d5-e4c1-41d4-b237-272eba0cea9e	Ford	Transit Custom	Utilitaires	10 places assises • Manuel • Assurée	/img/vehicles/ford1.jpg	10	Essence	Manuel	40000.00	40000.00	t	ACTIVE	2026-08-20 10:43:56.248+00	2026-08-22 11:13:41.604+00	\N
64e7bfb6-e267-420a-99b4-4a2272f1ddfa	Volkswagen	Crafter	Utilitaires	10 places assises • Manuel • Assurée	/img/vehicles/vw_crafter.jpg	10	Essence	Manuel	48000.00	48000.00	t	ACTIVE	2026-08-20 10:43:56.252+00	2026-08-22 11:13:41.606+00	\N
6c3ca9fa-e716-439d-98f1-41aef5070ead	Range	Rover	SUV	5 personnes • Automatique • Assurée	/img/vehicles/range_rover.jpg	5	Essence	Automatique	180000.00	180000.00	t	ACTIVE	2026-08-20 10:43:56.372+00	2026-08-22 11:13:41.608+00	\N
ea0a748e-4fb2-4232-b146-c0b2d8efe5c7	Kia	Grandbird	Minibus	15 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	15	Essence	Manuel	95000.00	95000.00	t	ACTIVE	2026-08-20 10:43:56.286+00	2026-08-22 11:25:20.472+00	\N
8a9bc283-7281-4dc7-9ac3-58a1e33502c5	Mercedes-Benz	Classe E	SUV	5 personnes • Automatique • Assurée	/img/vehicles/mercedes_e300.jpg	5	Essence	Automatique	150000.00	150000.00	t	ACTIVE	2026-08-20 10:43:56.355+00	2026-08-22 11:13:41.614+00	\N
c9f4d2ad-9d48-49b8-aea8-8ab9107b2dc4	Toyota	Hiace 12 Places	Minibus	12 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	12	Essence	Manuel	80000.00	80000.00	t	ACTIVE	2026-08-20 10:43:56.26+00	2026-08-22 11:25:20.474+00	\N
a434bb28-3c85-4c85-9cdc-a776d083beac	Fiat	Doblo	Utilitaires	3 places assises • Manuel • Assurée	/img/vehicles/fiat_doblo.jpg	3	Essence	Manuel	29000.00	29000.00	t	ACTIVE	2026-08-20 10:43:56.23+00	2026-08-22 11:13:41.621+00	\N
930da43e-e110-48ba-b16c-d6725e7654d4	Peugeot	Boxer 10 Places	Minibus	10 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	10	Essence	Manuel	60000.00	60000.00	t	ACTIVE	2026-08-20 10:43:56.296+00	2026-08-22 11:25:20.477+00	\N
eff65934-a3a1-49a9-b705-d1855773ff50	Citroën	Berlingo	Utilitaires	3 places assises • Manuel • Assurée	/img/vehicles/citroen_berlingo.jpg	3	Essence	Manuel	28000.00	28000.00	t	ACTIVE	2026-08-20 10:43:56.223+00	2026-08-22 11:13:41.616+00	\N
043c2c74-2e15-4fd9-8a01-e17a6459a192	Porsche	Cayenne	SUV	5 personnes • Automatique • Assurée	/img/vehicles/porsche_cayenne.jpg	5	Essence	Automatique	200000.00	200000.00	t	ACTIVE	2026-08-20 10:43:56.377+00	2026-08-22 11:13:41.631+00	\N
117ae849-935d-45e4-aef6-87dbfaed82aa	BMW	Série 5	SUV	5 personnes • Automatique • Assurée	/img/vehicles/bmw_530i.jpg	5	Essence	Automatique	160000.00	160000.00	t	ACTIVE	2026-08-20 10:43:56.36+00	2026-08-22 11:13:41.635+00	\N
3b713b91-a7d9-44c2-910e-a5a60a6d9de2	Peugeot	Partner	Utilitaires	3 places assises • Manuel • Assurée	/img/vehicles/peugeot_partner.jpg	3	Essence	Manuel	28000.00	28000.00	t	ACTIVE	2026-08-20 10:43:56.215+00	2026-08-22 11:13:41.637+00	\N
46af74be-b9bf-4cf7-adbf-de91bf68deeb	Audi	A6	SUV	5 personnes • Automatique • Assurée	/img/vehicles/audia6.jpg	5	Essence	Automatique	155000.00	155000.00	t	ACTIVE	2026-08-20 10:43:56.365+00	2026-08-22 11:13:41.641+00	\N
18bd2d44-0a0b-4896-9056-a941527a4cde	Lexus	RX	SUV	5 personnes • Automatique • Assurée	/img/vehicles/lexus_rx.jpg	5	Essence	Automatique	140000.00	140000.00	t	ACTIVE	2026-08-20 10:43:56.368+00	2026-08-22 11:13:41.644+00	\N
974f86f5-36d6-423f-b2c0-8ac9b5904197	Mahindra	Pik Up	Pick-Up	5 personnes • Manuel • Assurée	/img/vehicles/toyota_hilux.jpg	5	Essence	Manuel	45000.00	45000.00	t	ACTIVE	2026-08-20 10:43:56.189+00	2026-08-22 11:25:20.499+00	\N
2d111d35-2ff1-4896-95f9-64ae28361c15	Renault	Master	Utilitaires	10 places assises • Manuel • Assurée	/img/vehicles/renault_master.jpg	10	Essence	Manuel	42000.00	42000.00	t	ACTIVE	2026-08-20 10:43:56.244+00	2026-08-22 11:13:41.648+00	\N
94aa9d6b-7349-42b5-a217-e265ef4a92dd	Hyundai	Sonata Limited	Berline	5 personnes • Automatique • Écran Panoramique	/img/vehicles/hyundai_sonata.jpg	5	Essence	Automatique	35000.00	35000.00	t	ACTIVE	2026-08-22 11:01:47.624+00	2026-08-22 11:13:41.652+00	\N
bc6d6a95-6fba-4706-8fac-04e86c291e6e	Mercedes-Benz	Classe S	SUV	5 personnes • Automatique • Assurée	/img/vehicles/mercedes_s500.jpg	5	Essence	Automatique	250000.00	250000.00	t	ACTIVE	2026-08-20 10:43:56.381+00	2026-08-22 11:13:41.654+00	\N
cf1e4aea-3302-4722-8303-7b5bd00d1aa9	Toyota	Camry Hybrid	Berline	5 personnes • Automatique • Confort & Silence	/img/vehicles/camry.jpg	5	Essence	Automatique	40000.00	40000.00	t	ACTIVE	2026-08-22 11:01:47.584+00	2026-08-22 11:13:41.656+00	\N
39e9806a-46d1-43a2-8296-b4172f929216	Mercedes-Benz	Classe S 500	Berline	5 personnes • Automatique • Luxe & Chauffeur	/img/vehicles/mercedes_s500.jpg	5	Essence	Automatique	150000.00	150000.00	t	ACTIVE	2026-08-22 11:01:47.532+00	2026-08-22 11:13:41.658+00	\N
ddb9c506-0994-46d4-8ef6-d7e6020a0f6e	Hyundai	Elantra GT	Berline	5 personnes • Automatique • Design Moderne	/img/vehicles/hyundai_elantra.jpg	5	Essence	Automatique	27000.00	27000.00	t	ACTIVE	2026-08-22 11:01:47.631+00	2026-08-22 11:13:41.66+00	\N
9781c400-55e7-4c26-b336-3bab186d7aeb	Mercedes-Benz	Classe C 200	Berline	5 personnes • Automatique • Climatisée & Assurée	/img/vehicles/c200.jpg	5	Essence	Automatique	50000.00	50000.00	t	ACTIVE	2026-08-22 11:01:47.465+00	2026-08-22 11:13:41.665+00	\N
4cce2c17-b16d-4ce2-ab60-d27b736c8bc6	Lexus	LS 500	Berline	5 personnes • Automatique • Prestige Japonais	/img/vehicles/lexus_ls.jpg	5	Essence	Automatique	130000.00	130000.00	t	ACTIVE	2026-08-22 11:01:47.606+00	2026-08-22 11:13:41.669+00	\N
040ea665-a5c3-44fb-9a94-84332fcf1d9b	Citroën	Jumper 12 Places	Minibus	12 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	12	Essence	Manuel	62000.00	62000.00	t	ACTIVE	2026-08-20 10:43:56.302+00	2026-08-22 11:25:20.486+00	\N
6cb2e2c1-e7eb-476f-a1f2-f7d7696c20be	MAN	Lion Coach	Autocar	50 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	50	Essence	Manuel	200000.00	200000.00	t	ACTIVE	2026-08-20 10:43:56.338+00	2026-08-22 11:25:20.489+00	\N
3df4671b-7b18-4ac7-a75c-73c4e7e7305e	Honda	Civic Sedan	Berline	5 personnes • Automatique • Économique	/img/vehicles/honda_civic.jpg	5	Essence	Automatique	28000.00	28000.00	t	ACTIVE	2026-08-22 11:01:47.618+00	2026-08-22 11:13:41.672+00	\N
44e9a0da-5d31-43a2-a212-b26ad449ddcf	Dongfeng	Rich	Pick-Up	5 personnes • Manuel • Assurée	/img/vehicles/toyota_hilux.jpg	5	Essence	Manuel	48000.00	48000.00	t	ACTIVE	2026-08-20 10:43:56.201+00	2026-08-22 11:25:20.492+00	\N
a7720ffc-5fae-4317-95d4-42c49b59acb6	BMW	Série 5 530i	Berline	5 personnes • Automatique • Élégance Premium	/img/vehicles/bmw_530i.jpg	5	Essence	Automatique	75000.00	75000.00	t	ACTIVE	2026-08-22 11:01:47.549+00	2026-08-22 11:13:41.677+00	\N
ba5af11c-b5bc-4dc9-909f-a68d6d69621c	Yutong	ZK6122	Autocar	55 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	55	Essence	Manuel	180000.00	180000.00	t	ACTIVE	2026-08-20 10:43:56.342+00	2026-08-22 11:25:20.494+00	\N
641ef6f2-e7c2-482e-a921-5780b77804f3	Scania	Irizar	Autocar	50 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	50	Essence	Manuel	210000.00	210000.00	t	ACTIVE	2026-08-20 10:43:56.333+00	2026-08-22 11:25:20.497+00	\N
b65bfb12-cdfc-4fb2-a423-a9d1a07b7d39	BMW	Série 3 320i	Berline	5 personnes • Automatique • Sport & Confort	/img/vehicles/bmw320.jpg	5	Essence	Automatique	50000.00	50000.00	t	ACTIVE	2026-08-22 11:01:47.541+00	2026-08-22 11:13:41.679+00	\N
d95c4606-e8db-4066-b38c-e17c5bb97fcd	Kia	K5 / Optima GT	Berline	5 personnes • Automatique • Finition GT	/img/vehicles/kia_k5.jpg	5	Essence	Automatique	36000.00	36000.00	t	ACTIVE	2026-08-22 11:01:47.637+00	2026-08-22 11:13:41.683+00	\N
f9944c81-3705-4c84-a1c7-c08dfd99bdb7	Audi	A8 L	Berline	5 personnes • Automatique • Luxe Absolu	/img/vehicles/audi_a8.jpg	5	Essence	Automatique	135000.00	135000.00	t	ACTIVE	2026-08-22 11:01:47.577+00	2026-08-22 11:13:41.689+00	\N
ff9793d5-8136-4966-a7fb-390acad4963a	BMW	Série 7 740Li	Berline	5 personnes • Automatique • VIP Prestige	/img/vehicles/bmw_740li.jpg	5	Essence	Automatique	140000.00	140000.00	t	ACTIVE	2026-08-22 11:01:47.556+00	2026-08-22 11:13:41.691+00	\N
3896ebf8-410e-41a8-a3c1-dac12bc98c87	Kia	Cerato Sedan	Berline	5 personnes • Automatique • Pratique & Confort	/img/vehicles/kia_cerato.jpg	5	Essence	Automatique	26000.00	26000.00	t	ACTIVE	2026-08-22 11:01:47.643+00	2026-08-22 11:13:41.646+00	\N
f57ea013-ed12-496a-bce7-2e1eb4ae5f64	Lexus	ES 350	Berline	5 personnes • Automatique • Grand Luxe	/img/vehicles/lexus_es.jpg	5	Essence	Automatique	65000.00	65000.00	t	ACTIVE	2026-08-22 11:01:47.599+00	2026-08-22 11:13:41.662+00	\N
dd450b0d-5eec-4d53-8b77-30d8c946f925	Audi	Q7	SUV	7 personnes • Automatique • Assurée	/img/vehicles/audi_q7.jpg	7	Essence	Automatique	175000.00	175000.00	t	ACTIVE	2026-08-20 10:43:56.389+00	2026-08-22 11:13:41.685+00	\N
e6e98615-001a-4366-ad35-bb10a9de3fe6	Mercedes-Benz	Classe E 300	Berline	5 personnes • Automatique • Climatisée & Assurée	/img/vehicles/mercedes_e300.jpg	5	Essence	Automatique	75000.00	75000.00	t	ACTIVE	2026-08-22 11:01:47.522+00	2026-08-22 11:13:41.687+00	\N
2721fc0f-1879-49f5-bd36-adebc7c3ee43	Volkswagen	Passat R-Line	Berline	5 personnes • Automatique • Qualité Allemande	/img/vehicles/vw_passat.jpg	5	Essence	Automatique	42000.00	42000.00	t	ACTIVE	2026-08-22 11:01:47.679+00	2026-08-22 11:13:41.697+00	\N
2a99fb07-f98a-4f9e-b4e7-c7b8a1fff1f0	Tesla	Model 3 Long Range	Berline	5 personnes • Automatique • 100% Électrique	/img/vehicles/tesla_model3.jpg	5	Essence	Automatique	60000.00	60000.00	t	ACTIVE	2026-08-22 11:01:47.708+00	2026-08-22 11:13:41.699+00	\N
37abace8-40d2-42f8-aa28-f856f187dc01	Audi	A4 TFSI	Berline	5 personnes • Automatique • Cuir & GPS	/img/vehicles/audi_a4.jpg	5	Essence	Automatique	48000.00	48000.00	t	ACTIVE	2026-08-22 11:01:47.563+00	2026-08-22 11:13:41.701+00	\N
4a940280-1fc6-484d-aad3-9bc4d3d87a06	Mitsubishi	L200 New	Pick-Up	5 personnes • Manuel • Assurée	/img/vehicles/l200av.jpg	5	Essence	Manuel	52000.00	52000.00	t	ACTIVE	2026-08-20 10:43:56.172+00	2026-08-22 11:13:41.704+00	\N
5b4caebb-b912-4af0-952c-0f54e273e0e0	Genesis	G80 Luxury	Berline	5 personnes • Automatique • VIP Affaires	/img/vehicles/genesis_g80.jpg	5	Essence	Automatique	80000.00	80000.00	t	ACTIVE	2026-08-22 11:01:47.701+00	2026-08-22 11:13:41.715+00	\N
740d176f-6f00-49ee-92ef-32aebb8becd2	Peugeot	508 GT	Berline	5 personnes • Automatique • Design Français	/img/vehicles/peugeot508.jpg	5	Essence	Automatique	45000.00	45000.00	t	ACTIVE	2026-08-22 11:01:47.653+00	2026-08-22 11:13:41.723+00	\N
c2a4c5c1-b1e5-45dc-b4f1-126532a21be3	Peugeot	308 Sedan	Berline	5 personnes • Automatique • Agile & Économe	/img/vehicles/peugeot_308.jpg	5	Essence	Automatique	28000.00	28000.00	t	ACTIVE	2026-08-22 11:01:47.674+00	2026-08-22 11:13:41.735+00	\N
da832188-7011-4e5e-a096-a8bedd47f6d2	Peugeot	208	Citadines	5 personnes • Automatique • Assurée	/img/vehicles/peugeot_208.jpg	5	Essence	Automatique	22000.00	22000.00	t	ACTIVE	2026-08-20 10:43:55.99+00	2026-08-22 11:13:41.736+00	\N
ead90be3-181d-4252-88e5-f3cf72ca2626	Hyundai	Tucson	SUV	5 personnes • Automatique • Assurée	/img/vehicles/hyundai_tucson.jpg	5	Essence	Automatique	42000.00	42000.00	t	ACTIVE	2026-08-20 10:43:56.043+00	2026-08-22 11:13:41.739+00	\N
15dbf702-f610-4da9-b9dc-4b8a25e4bfec	BMW	X5	SUV	5 personnes • Automatique • Assurée	/img/vehicles/bmw_x5.jpg	5	Essence	Automatique	170000.00	170000.00	t	ACTIVE	2026-08-20 10:43:56.385+00	2026-08-22 11:13:41.693+00	\N
2613a036-8767-4384-ab4c-523ff99a5a2a	Nissan	Navara	Pick-Up	5 personnes • Manuel • Assurée	/img/vehicles/nissan_navara.jpg	5	Essence	Manuel	58000.00	58000.00	t	ACTIVE	2026-08-20 10:43:56.166+00	2026-08-22 11:13:41.695+00	\N
3e86b65c-cbf5-4de2-b73b-7435d98bdfb1	Toyota	Yaris	Citadines	5 personnes • Automatique • Assurée	/img/vehicles/toyota_yaris.jpg	5	Essence	Automatique	20000.00	20000.00	t	ACTIVE	2026-08-20 10:43:55.931+00	2026-08-22 11:13:41.702+00	\N
4f8d9996-82f9-47af-a6ad-a56bb5a8ad8c	Mitsubishi	Pajero Sport	4x4	7 personnes • Automatique • Assurée	/img/vehicles/pajero_sport.jpg	7	Essence	Automatique	80000.00	80000.00	t	ACTIVE	2026-08-20 10:43:56.136+00	2026-08-22 11:13:41.706+00	\N
4fae96e5-9e84-49f0-8182-88fc5d57526f	Jaguar	XF Portfolio	Berline	5 personnes • Automatique • Chic Britannique	/img/vehicles/jaguar_xf.jpg	5	Essence	Automatique	90000.00	90000.00	t	ACTIVE	2026-08-22 11:01:47.712+00	2026-08-22 11:13:41.708+00	\N
59317da0-b0dd-4ac2-ab50-51198cca0238	Volvo	9700	Autocar	55 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	55	Essence	Manuel	220000.00	220000.00	t	ACTIVE	2026-08-20 10:43:56.329+00	2026-08-22 11:25:20.505+00	\N
59d37a04-9969-4603-be25-bbf21549ace9	Hyundai	28 Places	Autocar	28 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	28	Essence	Manuel	125000.00	125000.00	t	ACTIVE	2026-08-14 11:06:55.397+00	2026-08-22 11:13:41.713+00	125000.00
68b7bb42-b388-4a2a-b238-66e63990befa	Hyundai	H350	Minibus	15 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	15	Essence	Manuel	90000.00	90000.00	t	ACTIVE	2026-08-20 10:43:56.282+00	2026-08-22 11:25:20.507+00	\N
62552652-ee96-4374-8a1a-65cdd933550c	Ford	Ranger 4x4	4x4	5 personnes • Manuel • Assurée	/img/vehicles/ford_ranger.jpg	5	Essence	Manuel	65000.00	65000.00	t	ACTIVE	2026-08-20 10:43:56.132+00	2026-08-22 11:13:41.719+00	\N
5fc83db7-9171-4c47-8a8e-3eb508c0fcbc	Nissan	Urvan 14 Places	Minibus	14 places assises • Manuel • Avec chauffeur	/img/vehicles/urvan1.jpeg	14	Essence	Manuel	75000.00	75000.00	t	ACTIVE	2026-08-20 10:43:56.265+00	2026-08-22 11:25:44.841+00	\N
7795d366-d86f-4ef1-910b-aafa91c9f635	Nissan	Maxima Platinum	Berline	5 personnes • Automatique • Moteur V6 Sport	/img/vehicles/nissan_maxima.jpg	5	Essence	Automatique	45000.00	45000.00	t	ACTIVE	2026-08-22 11:01:47.697+00	2026-08-22 11:13:41.725+00	\N
8b4ccc88-07c9-477a-aab4-a1384385cfcf	Volvo	S90 Inscription	Berline	5 personnes • Automatique • Sécurité Maximale	/img/vehicles/volvo_s90.jpg	5	Essence	Automatique	85000.00	85000.00	t	ACTIVE	2026-08-22 11:01:47.705+00	2026-08-22 11:13:41.727+00	\N
9fca1657-6164-47c8-96c1-419a210b4cc6	Nissan	Altima SL	Berline	5 personnes • Automatique • Zero Gravity Seats	/img/vehicles/nissan_altima.jpg	5	Essence	Automatique	35000.00	35000.00	t	ACTIVE	2026-08-22 11:01:47.693+00	2026-08-22 11:13:41.729+00	\N
a5be804d-b19e-4271-99e0-c688d8b7a95b	Volkswagen	Jetta Highline	Berline	5 personnes • Automatique • Sobriété	/img/vehicles/vw_jetta.jpg	5	Essence	Automatique	28000.00	28000.00	t	ACTIVE	2026-08-22 11:01:47.684+00	2026-08-22 11:13:41.731+00	\N
b3a9471a-dd43-478f-a016-62396a2247bd	Mazda	6 Grand Touring	Berline	5 personnes • Automatique • Cuir & Sièges Chauffants	/img/vehicles/mazda_6.jpg	5	Essence	Automatique	38000.00	38000.00	t	ACTIVE	2026-08-22 11:01:47.689+00	2026-08-22 11:13:41.733+00	\N
7eb907a8-bd77-4fea-b733-cf9727dbec58	Audi	A6 Quattro	Berline	5 personnes • Automatique • Executive Class	/img/vehicles/audia6.jpg	5	Essence	Automatique	70000.00	70000.00	t	ACTIVE	2026-08-22 11:01:47.57+00	2026-08-22 11:13:41.741+00	\N
82a9ce83-14f2-4705-9ad7-b322836a0b5d	Volkswagen	Polo	Citadines	5 personnes • Automatique • Assurée	/img/vehicles/vw_polo.jpg	5	Essence	Automatique	23000.00	23000.00	t	ACTIVE	2026-08-20 10:43:56.002+00	2026-08-22 11:13:41.744+00	\N
ac8c125b-4164-4461-bc48-13fee7255857	Dongfeng	Friday	Pick-Up	5 personnes • Manuel • Assurée	/img/vehicles/toyota_hilux.jpg	5	Essence	Manuel	60000.00	60000.00	t	ACTIVE	2026-08-14 11:06:55.325+00	2026-08-22 11:25:20.523+00	60000.00
89dda94e-ff73-4a68-b464-fe5fcd7549b8	Suzuki	Fronx	Citadines	5 personnes • Automatique • Assurée	/img/vehicles/fronxav.jpeg	5	Essence	Automatique	30000.00	30000.00	t	ACTIVE	2026-08-14 11:06:55.3+00	2026-08-22 11:13:41.748+00	30000.00
b241946e-8aa0-4d48-b3de-cd713b2d46a9	Iveco	Daily 20 Places	Minibus	20 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	20	Essence	Manuel	100000.00	100000.00	t	ACTIVE	2026-08-20 10:43:56.277+00	2026-08-22 11:25:20.526+00	\N
a4496638-2064-4f12-8b2d-6e4e018f2520	Hyundai	20 Places	Autocar	20 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	20	Essence	Manuel	110000.00	110000.00	t	ACTIVE	2026-08-14 11:06:55.385+00	2026-08-22 11:13:41.752+00	110000.00
aa2a66ae-6e52-442e-a5ce-f138355260a5	Toyota	Fortuner 4x4	4x4	7 personnes • Automatique • Assurée	/img/vehicles/fortuner.jpg	7	Essence	Automatique	85000.00	85000.00	t	ACTIVE	2026-08-20 10:43:56.141+00	2026-08-22 11:13:41.754+00	\N
cc35a1c7-1d8d-4d42-8cd8-5464900aa823	Hyundai	45 Places	Autocar	45 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	45	Essence	Manuel	160000.00	160000.00	t	ACTIVE	2026-08-20 10:43:56.315+00	2026-08-22 11:25:20.534+00	\N
b008697a-b949-4691-9d89-a3b5f17d96dd	Honda	Accord Touring	Berline	5 personnes • Automatique • Spacieuse	/img/vehicles/honda_accord.jpg	5	Essence	Automatique	38000.00	38000.00	t	ACTIVE	2026-08-22 11:01:47.611+00	2026-08-22 11:13:41.758+00	\N
da3e2906-b1d3-481e-bb98-e9785c725fd9	Isuzu	MU-X	4x4	7 personnes • Automatique • Assurée	/img/vehicles/pajero_sport.jpg	7	Essence	Automatique	75000.00	75000.00	t	ACTIVE	2026-08-20 10:43:56.147+00	2026-08-22 11:25:20.541+00	\N
b2db1018-be1a-40e0-b208-c85e31f46e30	Suzuki	Jimny	4x4	4 personnes • Manuel • Assurée	/img/vehicles/suzuki_jimny.jpg	4	Essence	Manuel	40000.00	40000.00	t	ACTIVE	2026-08-20 10:43:56.151+00	2026-08-22 11:13:41.762+00	\N
bf4260ee-84bb-4d7f-ab9f-2d37d70cf8e8	Toyota	Rush 38	4x4	7 personnes • Automatique • Assurée	/img/vehicles/rushavant.jpeg	7	Essence	Automatique	50000.00	50000.00	t	ACTIVE	2026-08-14 11:06:55.332+00	2026-08-22 11:13:41.764+00	50000.00
c0e4b90e-b1eb-4ded-ae86-3ccd22524f34	Kia	Sportage	SUV	5 personnes • Automatique • Assurée	/img/vehicles/kia_sportage.jpg	5	Essence	Automatique	43000.00	43000.00	t	ACTIVE	2026-08-20 10:43:56.053+00	2026-08-22 11:13:41.766+00	\N
c89115f8-9364-4a5d-88d1-1df0ebe7fc86	Jeep	Wrangler	4x4	5 personnes • Automatique • Assurée	/img/vehicles/jeep_wrangler.jpg	5	Essence	Automatique	90000.00	90000.00	t	ACTIVE	2026-08-20 10:43:56.116+00	2026-08-22 11:13:41.768+00	\N
cbbd294a-724f-467a-bd77-9be8f70de995	Toyota	Corolla Executive	Berline	5 personnes • Automatique • Fiable & Climatisée	/img/vehicles/toyota_corolla.jpg	5	Essence	Automatique	30000.00	30000.00	t	ACTIVE	2026-08-22 11:01:47.592+00	2026-08-22 11:13:41.77+00	\N
ccd2d95b-6323-4676-a11c-9564cf710cc8	Toyota	Hiace 15 Places	Minibus	15 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	15	Essence	Manuel	90000.00	90000.00	t	ACTIVE	2026-08-14 11:06:55.375+00	2026-08-22 11:13:41.773+00	90000.00
d2f0eac4-c158-43d8-8124-b565a9cf49c1	Nissan	Micra	Citadines	5 personnes • Automatique • Assurée	/img/vehicles/nissan_micra.jpg	5	Essence	Automatique	27820.00	27820.00	t	ACTIVE	2026-08-14 11:06:55.354+00	2026-08-22 11:13:41.775+00	27820.00
dcf24df3-4054-48f7-99dc-2c285d2ed1dd	Renault	Kangoo	Utilitaires	3 places assises • Manuel • Assurée	/img/vehicles/renault_kangoo.jpg	3	Essence	Manuel	27000.00	27000.00	t	ACTIVE	2026-08-20 10:43:56.219+00	2026-08-22 11:13:41.779+00	\N
e3e69471-caa2-45aa-a01b-9e7f3bba0d70	Mitsubishi	Outlander	SUV	5 personnes • Automatique • Assurée	/img/vehicles/mitsubishi_outlander.jpg	5	Essence	Automatique	44000.00	44000.00	t	ACTIVE	2026-08-20 10:43:56.094+00	2026-08-22 11:13:41.781+00	\N
eb17b507-5dfb-47c2-8dad-9c4451f7ffb0	Volvo	XC90	SUV	7 personnes • Automatique • Assurée	/img/vehicles/volvo_xc90.jpg	7	Essence	Automatique	165000.00	165000.00	t	ACTIVE	2026-08-20 10:43:56.395+00	2026-08-22 11:13:41.783+00	\N
f101e259-a8fb-489a-bfdb-d6dbe3ff2317	Toyota	Hilux	Pick-Up	5 personnes • Manuel • Assurée	/img/vehicles/toyota_hilux.jpg	5	Essence	Manuel	55000.00	55000.00	t	ACTIVE	2026-08-20 10:43:56.155+00	2026-08-22 11:13:41.785+00	\N
f771e078-04ce-4a39-b7a7-e3f1b6325836	Toyota	Vitz	Citadines	5 personnes • Automatique • Assurée	/img/vehicles/swiftavant.png	5	Essence	Automatique	20700.00	20700.00	t	ACTIVE	2026-08-14 11:06:55.308+00	2026-08-22 11:13:41.788+00	20700.00
9defb13e-30cd-4588-b7dd-2c2a1d94ece7	Mercedes	Sprinter 18 Places	Minibus	18 places assises • Manuel • Avec chauffeur	/img/vehicles/mercedes_sprinter.jpg	18	Essence	Manuel	95000.00	95000.00	t	ACTIVE	2026-08-20 10:43:56.272+00	2026-08-22 11:25:44.855+00	\N
f34ecfaa-2ebf-4365-95d7-60e49b74f7bb	Hyundai	40 Places	Autocar	40 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	40	Essence	Manuel	150000.00	150000.00	t	ACTIVE	2026-08-20 10:43:56.306+00	2026-08-22 11:25:20.514+00	\N
890ced86-8cf1-4499-b227-2257ad5a94f5	King	Long XMQ6127	Autocar	55 places assises • Manuel • Avec chauffeur	/img/vehicles/h1ec.jpg	55	Essence	Manuel	175000.00	175000.00	t	ACTIVE	2026-08-20 10:43:56.348+00	2026-08-22 11:25:20.517+00	\N
\.


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: articles_devis articles_devis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles_devis
    ADD CONSTRAINT articles_devis_pkey PRIMARY KEY (id);


--
-- Name: articles_panier articles_panier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles_panier
    ADD CONSTRAINT articles_panier_pkey PRIMARY KEY (id);


--
-- Name: categories categories_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_nom_key UNIQUE (nom);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: clients clients_utilisateur_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_utilisateur_id_key UNIQUE (utilisateur_id);


--
-- Name: demandes_devis demandes_devis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_devis
    ADD CONSTRAINT demandes_devis_pkey PRIMARY KEY (id);


--
-- Name: demandes_devis demandes_devis_reference_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_devis
    ADD CONSTRAINT demandes_devis_reference_key UNIQUE (reference);


--
-- Name: demandes_produits demandes_produits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_produits
    ADD CONSTRAINT demandes_produits_pkey PRIMARY KEY (id);


--
-- Name: demandes_vehicules demandes_vehicules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_vehicules
    ADD CONSTRAINT demandes_vehicules_pkey PRIMARY KEY (id);


--
-- Name: devis devis_numero_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devis
    ADD CONSTRAINT devis_numero_key UNIQUE (numero);


--
-- Name: devis devis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devis
    ADD CONSTRAINT devis_pkey PRIMARY KEY (id);


--
-- Name: entreprises entreprises_client_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entreprises
    ADD CONSTRAINT entreprises_client_id_key UNIQUE (client_id);


--
-- Name: entreprises entreprises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entreprises
    ADD CONSTRAINT entreprises_pkey PRIMARY KEY (id);


--
-- Name: mouvements_stock mouvements_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mouvements_stock
    ADD CONSTRAINT mouvements_stock_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: paniers paniers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paniers
    ADD CONSTRAINT paniers_pkey PRIMARY KEY (id);


--
-- Name: parametres parametres_cle_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parametres
    ADD CONSTRAINT parametres_cle_key UNIQUE (cle);


--
-- Name: parametres parametres_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parametres
    ADD CONSTRAINT parametres_pkey PRIMARY KEY (id);


--
-- Name: produits produits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produits
    ADD CONSTRAINT produits_pkey PRIMARY KEY (id);


--
-- Name: produits produits_reference_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produits
    ADD CONSTRAINT produits_reference_key UNIQUE (reference);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_confirmed_dates_no_overlap; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_confirmed_dates_no_overlap EXCLUDE USING gist (vehicule_id WITH =, tstzrange(commence_le, termine_le, '[)'::text) WITH &&) WHERE ((statut = 'CONFIRMED'::public.enum_reservations_statut));


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_reference_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_reference_key UNIQUE (reference);


--
-- Name: tarifs tarifs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarifs
    ADD CONSTRAINT tarifs_pkey PRIMARY KEY (id);


--
-- Name: tarifs tarifs_produit_client_type_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarifs
    ADD CONSTRAINT tarifs_produit_client_type_unique UNIQUE (produit_id, type_client);


--
-- Name: utilisateurs utilisateurs_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_email_key UNIQUE (email);


--
-- Name: utilisateurs utilisateurs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_pkey PRIMARY KEY (id);


--
-- Name: utilisateurs utilisateurs_telephone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_telephone_key UNIQUE (telephone);


--
-- Name: vehicule_prix_entreprises vehicule_prix_entreprises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicule_prix_entreprises
    ADD CONSTRAINT vehicule_prix_entreprises_pkey PRIMARY KEY (id);


--
-- Name: vehicules vehicules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicules
    ADD CONSTRAINT vehicules_pkey PRIMARY KEY (id);


--
-- Name: demandes_devis_cree_le; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX demandes_devis_cree_le ON public.demandes_devis USING btree (cree_le);


--
-- Name: demandes_devis_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX demandes_devis_email ON public.demandes_devis USING btree (email);


--
-- Name: demandes_devis_statut; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX demandes_devis_statut ON public.demandes_devis USING btree (statut);


--
-- Name: demandes_produits_statut_cree_le; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX demandes_produits_statut_cree_le ON public.demandes_produits USING btree (statut, cree_le);


--
-- Name: demandes_vehicules_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX demandes_vehicules_client_id ON public.demandes_vehicules USING btree (client_id);


--
-- Name: demandes_vehicules_cree_le; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX demandes_vehicules_cree_le ON public.demandes_vehicules USING btree (cree_le);


--
-- Name: demandes_vehicules_statut; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX demandes_vehicules_statut ON public.demandes_vehicules USING btree (statut);


--
-- Name: demandes_vehicules_utilisateur_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX demandes_vehicules_utilisateur_id ON public.demandes_vehicules USING btree (utilisateur_id);


--
-- Name: idx_demandes_vehicules_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_demandes_vehicules_client ON public.demandes_vehicules USING btree (client_id);


--
-- Name: idx_demandes_vehicules_cree; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_demandes_vehicules_cree ON public.demandes_vehicules USING btree (cree_le);


--
-- Name: idx_demandes_vehicules_statut; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_demandes_vehicules_statut ON public.demandes_vehicules USING btree (statut);


--
-- Name: idx_demandes_vehicules_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_demandes_vehicules_user ON public.demandes_vehicules USING btree (utilisateur_id);


--
-- Name: notifications_utilisateur_destinataire_id_est_lu_cree_le; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_utilisateur_destinataire_id_est_lu_cree_le ON public.notifications USING btree (utilisateur_destinataire_id, est_lu, cree_le);


--
-- Name: paniers_one_active_per_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX paniers_one_active_per_client ON public.paniers USING btree (client_id) WHERE (statut = 'ACTIVE'::public.enum_paniers_statut);


--
-- Name: produits_categorie_id_statut; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX produits_categorie_id_statut ON public.produits USING btree (categorie_id, statut);


--
-- Name: reservations_vehicule_id_statut_commence_le_termine_le; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reservations_vehicule_id_statut_commence_le_termine_le ON public.reservations USING btree (vehicule_id, statut, commence_le, termine_le);


--
-- Name: vehicule_prix_entreprises_vehicule_id_entreprise_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX vehicule_prix_entreprises_vehicule_id_entreprise_id ON public.vehicule_prix_entreprises USING btree (vehicule_id, entreprise_id);


--
-- Name: articles_devis articles_devis_devis_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles_devis
    ADD CONSTRAINT articles_devis_devis_id_fkey FOREIGN KEY (devis_id) REFERENCES public.devis(id) ON DELETE CASCADE;


--
-- Name: articles_devis articles_devis_produit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles_devis
    ADD CONSTRAINT articles_devis_produit_id_fkey FOREIGN KEY (produit_id) REFERENCES public.produits(id) ON DELETE SET NULL;


--
-- Name: articles_panier articles_panier_panier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles_panier
    ADD CONSTRAINT articles_panier_panier_id_fkey FOREIGN KEY (panier_id) REFERENCES public.paniers(id) ON DELETE CASCADE;


--
-- Name: articles_panier articles_panier_produit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles_panier
    ADD CONSTRAINT articles_panier_produit_id_fkey FOREIGN KEY (produit_id) REFERENCES public.produits(id) ON DELETE RESTRICT;


--
-- Name: articles_panier articles_panier_vehicule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles_panier
    ADD CONSTRAINT articles_panier_vehicule_id_fkey FOREIGN KEY (vehicule_id) REFERENCES public.vehicules(id) ON DELETE RESTRICT;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: clients clients_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE;


--
-- Name: demandes_devis demandes_devis_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_devis
    ADD CONSTRAINT demandes_devis_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: demandes_devis demandes_devis_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_devis
    ADD CONSTRAINT demandes_devis_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE SET NULL;


--
-- Name: demandes_produits demandes_produits_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_produits
    ADD CONSTRAINT demandes_produits_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: devis devis_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devis
    ADD CONSTRAINT devis_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE RESTRICT;


--
-- Name: entreprises entreprises_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entreprises
    ADD CONSTRAINT entreprises_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: mouvements_stock mouvements_stock_cree_par_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mouvements_stock
    ADD CONSTRAINT mouvements_stock_cree_par_utilisateur_id_fkey FOREIGN KEY (cree_par_utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE SET NULL;


--
-- Name: mouvements_stock mouvements_stock_produit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mouvements_stock
    ADD CONSTRAINT mouvements_stock_produit_id_fkey FOREIGN KEY (produit_id) REFERENCES public.produits(id) ON DELETE RESTRICT;


--
-- Name: notifications notifications_utilisateur_destinataire_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_utilisateur_destinataire_id_fkey FOREIGN KEY (utilisateur_destinataire_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE;


--
-- Name: paniers paniers_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paniers
    ADD CONSTRAINT paniers_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: produits produits_categorie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produits
    ADD CONSTRAINT produits_categorie_id_fkey FOREIGN KEY (categorie_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: promotions promotions_produit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_produit_id_fkey FOREIGN KEY (produit_id) REFERENCES public.produits(id) ON DELETE CASCADE;


--
-- Name: promotions promotions_vehicule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_vehicule_id_fkey FOREIGN KEY (vehicule_id) REFERENCES public.vehicules(id) ON DELETE CASCADE;


--
-- Name: reservations reservations_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE RESTRICT;


--
-- Name: reservations reservations_vehicule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_vehicule_id_fkey FOREIGN KEY (vehicule_id) REFERENCES public.vehicules(id) ON DELETE RESTRICT;


--
-- Name: tarifs tarifs_entreprise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarifs
    ADD CONSTRAINT tarifs_entreprise_id_fkey FOREIGN KEY (entreprise_id) REFERENCES public.entreprises(id) ON DELETE CASCADE;


--
-- Name: tarifs tarifs_produit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarifs
    ADD CONSTRAINT tarifs_produit_id_fkey FOREIGN KEY (produit_id) REFERENCES public.produits(id) ON DELETE CASCADE;


--
-- Name: vehicule_prix_entreprises vehicule_prix_entreprises_entreprise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicule_prix_entreprises
    ADD CONSTRAINT vehicule_prix_entreprises_entreprise_id_fkey FOREIGN KEY (entreprise_id) REFERENCES public.entreprises(id) ON DELETE CASCADE;


--
-- Name: vehicule_prix_entreprises vehicule_prix_entreprises_vehicule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicule_prix_entreprises
    ADD CONSTRAINT vehicule_prix_entreprises_vehicule_id_fkey FOREIGN KEY (vehicule_id) REFERENCES public.vehicules(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict hRfoa5S7FMu78WBFiWgCbZHgvh3pfAJd9KdduFyXgY3gD1rRFbQQfN96XVciFsU

