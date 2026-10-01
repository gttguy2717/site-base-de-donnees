# 🚀 WP Articles Showcase Pro - Plugin WordPress

Un plugin WordPress professionnel, moderne, ultra-rapide et responsive pour afficher vos articles de blog sous forme de **Grilles dynamiques**, **Listes magazines**, et **Carrousels tactiles (Sliders)**.

---

## ✨ Fonctionnalités Clés

- 🎯 **3 Dispositions Modernes :**
  - **Grille (Grid)** : 1, 2, 3 ou 4 colonnes responsives avec effet de survol dynamique (zoom d'image, ombres portées).
  - **Liste Magazine (List)** : Présentation horizontale élégante (image à gauche, contenu à droite).
  - **Carrousel Tactile (Slider)** : Défilement fluide, support tactile pour smartphones (swipe), boutons précédent/suivant, indicateurs de pagination (dots) et option autoplay.
- ⚡ **Pagination AJAX "Charger plus" :** Chargement dynamique des articles suivants sans rechargement de page, sécurisé par Nonce WordPress.
- ⏱️ **Temps de lecture estimé automatique** : Calcul instantané en fonction de la longueur de l'article (ex: `⏱️ 3 min de lecture`).
- 🏷️ **Badges de catégories colorés** : Affichage automatique de la catégorie sous forme de pill élégant au-dessus de l'image.
- 👤 **Auteur & Date** : Avatar de l'auteur, nom et date au format WordPress.
- 🎛️ **Générateur Visuel de Shortcode dans l'Admin** : Créez et personnalisez vos shortcodes en cochant simplement vos options, puis copiez le code généré en un seul clic !
- 🎨 **Personnalisation des couleurs & CSS** : Choisissez votre couleur d'accentuation principale et ajoutez votre propre code CSS depuis le panneau d'administration.
- 🎨 **Intégration Native Elementor 100% Modifiable Visuellement :**
  - **Widget dédié "Articles Showcase Pro"** disponible directement dans le panneau d'Elementor par glisser-déposer (Drag & Drop).
  - **Onglet Contenu** : Choisissez en temps réel la disposition (Grille, Liste, Slider), les colonnes, le nombre d'articles, filtrez par catégorie, activez/désactivez l'image, le badge, la date, le temps de lecture, l'extrait, et choisissez la pagination (AJAX "Charger plus" ou classique).
  - **Onglet Style complet** : Modifiez visuellement les couleurs (fond, titre, badge, métas, boutons), les typographies (polices, tailles, graisses), les bordures, ombres portées (Box Shadow) et espacements (Padding) avec aperçu direct en temps réel !
- 🔒 **Conforme aux standards de sécurité WordPress (WPCS)** : Échappement des sorties, assainissement strict des requêtes, jetons de sécurité (nonces).
- 📱 **100% Responsive & Léger** : Aucun framework externe lourd, JavaScript Vanilla ultra-léger.

---

## 📦 Installation Facile

### Méthode 1 : Téléversement du fichier ZIP (Recommandé)
1. Rendez-vous dans votre tableau de bord WordPress.
2. Allez dans **Extensions** > **Ajouter une extension**.
3. Cliquez sur le bouton **Téléverser une extension** en haut de page.
4. Sélectionnez le fichier `wp-articles-showcase.zip`.
5. Cliquez sur **Installer maintenant**, puis sur **Activer l'extension**.

### Méthode 2 : Par FTP / Dossier
1. Copiez le dossier `wp-articles-showcase` dans le répertoire `/wp-content/plugins/` de votre site WordPress.
2. Activez l'extension depuis le menu **Extensions** de votre tableau de bord.

---

## 🛠️ Utilisation des Shortcodes

Le shortcode de base s'écrit tout simplement :
```text
[wp_articles]
```

### Exemples Concrets :

#### 1. Grille moderne de 3 colonnes avec bouton "Charger plus" en AJAX :
```text
[wp_articles layout="grid" columns="3" posts_per_page="6" pagination="load_more"]
```

#### 2. Carrousel / Slider automatique (4 articles visibles, défilement auto) :
```text
[wp_articles layout="slider" columns="3" posts_per_page="8" slider_autoplay="true" slider_speed="3500"]
```

#### 3. Affichage des articles d'une seule catégorie ("actualites") :
```text
[wp_articles category="actualites" columns="3" posts_per_page="6"]
```

#### 4. Disposition en Liste horizontale :
```text
[wp_articles layout="list" posts_per_page="5"]
```

#### 5. Affichage minimaliste (sans auteur ni extrait) :
```text
[wp_articles layout="grid" columns="4" show_author="false" show_excerpt="false"]
```

---

## 📋 Liste Complète des Attributs

| Attribut | Valeurs possibles | Valeur par défaut | Description |
| :--- | :--- | :--- | :--- |
| `layout` | `grid`, `list`, `slider` | `grid` | Type de mise en page |
| `columns` | `1`, `2`, `3`, `4` | `3` | Nombre de colonnes |
| `posts_per_page` | Entier (ex: `6`, `12`) | `6` | Nombre d'articles par page |
| `category` | Slug de catégorie (ex: `tech`) | *(Toutes)* | Filtrer par une ou plusieurs catégories (séparées par une virgule) |
| `tag` | Slug d'étiquette | *(Tous)* | Filtrer par tag |
| `orderby` | `date`, `title`, `comment_count`, `rand` | `date` | Ordre de tri |
| `order` | `DESC`, `ASC` | `DESC` | Ordre décroissant ou croissant |
| `pagination` | `none`, `load_more`, `numeric` | `none` | Type de pagination |
| `show_image` | `true`, `false` | `true` | Afficher l'image à la une |
| `show_category`| `true`, `false` | `true` | Afficher le badge de la catégorie |
| `show_date` | `true`, `false` | `true` | Afficher la date de publication |
| `show_reading_time` | `true`, `false` | `true` | Afficher l'estimation du temps de lecture |
| `show_author` | `true`, `false` | `true` | Afficher l'avatar et nom de l'auteur |
| `show_excerpt` | `true`, `false` | `true` | Afficher l'extrait du contenu |
| `excerpt_length` | Entier (ex: `15`, `30`) | `20` | Nombre de mots maximum dans l'extrait |
| `show_readmore` | `true`, `false` | `true` | Afficher le bouton de lecture |
| `readmore_text` | Texte personnalisé | `Lire l’article` | Libellé du bouton de lecture |
| `slider_autoplay` | `true`, `false` | `false` | Défilement automatique pour le mode Slider |
| `slider_speed` | Millisecondes (ex: `4000`) | `4000` | Vitesse de transition du slider |

---

## 🎨 Utilisation Directe dans Elementor (100% Modifiable Visuellement)

Le plugin intègre un véritable **Widget Elementor natif** :

1. Ouvrez n'importe quelle page avec **Modifier avec Elementor**.
2. Dans le panneau de gauche des éléments, cherchez **"Articles Showcase Pro"** (ou parcourez la catégorie *Articles Showcase Pro*).
3. **Glissez-déposez** le widget directement sur votre page.
4. **Personnalisez tout à votre guise en temps réel :**
   - **Onglet Contenu** :
     - Changer de mise en page en un clic : Grille (Grid), Liste (List) ou Carrousel tactile (Slider).
     - Nombre de colonnes (1 à 4).
     - Filtrer par catégorie grâce à la liste déroulante dynamique de votre site.
     - Activer ou désactiver à la volée : Image à la une, Badge, Date, Temps de lecture estimé, Auteur, Extrait, Bouton "Lire l'article".
     - Activer la pagination AJAX avec bouton "Charger plus".
   - **Onglet Style** :
     - **Cartes** : Modifier la couleur de fond, le rayon des bordures (border-radius), l'ombre portée (Box Shadow) et les marges internes (Padding).
     - **Titres** : Changer la couleur, la couleur au survol et la typographie complète (police Google Fonts, taille, graisse, interligne).
     - **Badges de catégories** : Ajuster la couleur d'arrière-plan, la couleur du texte et la police.
     - **Métadonnées & Extrait** : Couleurs et typographies distinctes.
     - **Bouton d'action & Bouton Charger plus** : Couleurs de fond, couleurs au survol, arrondis, etc.

---

## 💻 Intégration par Shortcode (Gutenberg, Divi ou PHP)

Si vous n'utilisez pas Elementor sur certaines pages, vous pouvez toujours utiliser le shortcode :
- **Éditeur Gutenberg** : Insérez un bloc **Code court** (Shortcode) et collez `[wp_articles]`.
- **Modèles PHP de votre Thème** :
```php
<?php echo do_shortcode( '[wp_articles layout="grid" columns="3" posts_per_page="6"]' ); ?>
```

---

## 🔒 Sécurité & Performance

- Protection contre l'accès direct aux fichiers via `ABSPATH`.
- Utilisation des fonctions de nettoyage et d'échappement WordPress (`sanitize_text_field`, `esc_html`, `esc_url`, `esc_attr`).
- Vérification des Nonces pour les requêtes AJAX.
- Aucun script tiers lourd (0 dépendance jQuery pour le frontend, chargement asynchrone).
