# 📋 SYNTHÈSE - STRUCTURE ET FRAMEWORK PPA SERAPHIN

## 📌 Vue d'ensemble

Le **PPA (Projet Personnalisé d'Accompagnement)** est un document structuré qui synthétise :
- L'analyse de la situation de la personne
- Ses ressources et compétences
- Ses besoins sociaux identifiés
- Les axes d'accompagnement envisagés
- Les modalités concrètes de mise en œuvre

---

## 🎯 LES 8 AXES SERAPHIN À TRAVAILLER

| Axe | Description | Exemples de travail |
|-----|-------------|---------------------|
| **Communication** | Capacité à s'exprimer, comprendre autrui, gérer les relations | Améliorer l'expression orale, écrire des mails, gestion des conflits |
| **Mobilité & déplacements** | Autonomie dans les transports, accès aux lieux, liberté de mouvement | Utiliser les transports en commun, obtenir permis de conduire, accès aux services |
| **Autonomie quotidienne** | Gestion du quotidien (hygiène, repas, ménage, administrations) | Gestion budgétaire, hygiène personnelle, tâches ménagères |
| **Socialisation** | Construction et entretien du lien social, participation citoyenne | Activités collectives, loisirs, bénévolat, intégration communautaire |
| **Scolarité / Formation** | Parcours éducatif, compétences académiques, formations | Retour à la formation, alphabétisation, certifications |
| **Emploi & activité** | Accès à l'emploi, activité professionnelle, insertion économique | Recherche d'emploi, création d'activité, stage, formation professionnelle |
| **Santé & soins** | Santé physique/mentale, accès aux soins, hygiène de vie | Suivi médical, prévention, gestion des traitements, accès aux droits santé |
| **Logement & cadre de vie** | Accès au logement, qualité de vie, environnement de vie | Sortie de rue, accès au logement, conditions de vie, amélioration du cadre |

---

## 🔄 FLUX DE DONNÉES - ARCHITECTURE GÉNÉRALE

```
┌─────────────────────┐
│  PROMPT UTILISATEUR │  (Questions structurées + directives)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  BASE DE DONNEES    │  (Données contextuelles, historique)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ANALYSE DE TEXTE   │  (Entretien transcrit / texte libre)
│  (Textarea)         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  SYNTHESE & STRUCTURATION (par AXE)     │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  DOCUMENT PPA FINAL (Markdown / PDF)    │
└─────────────────────────────────────────┘
```

---

## 📋 TEMPLATE DE DONNÉES - TABLEAU STRUCTURÉ

| Élément | Axe Séraphin | Source (Prompt/DB/Texte) | Données brutes | Analyse | Objectifs SMART |
|---------|--------------|--------------------------|-----------------|---------|-----------------|
| **Ex: Autonomie quotidienne** | Autonomie | Entretien | "Difficultés à organiser ses repas, hygiène irrégulière" | Manque de structure, apprentissage possible | D'ici 3 mois: faire 3 repas par jour équilibrés avec accompagnement |
| **Communication** | Communication | Prompt + Texte | "Peu à l'aise pour parler en groupe" | Timidité, ressources: cours d'anglais en groupe | Participer à 1 activité collective par semaine dans 2 mois |
| **Mobilité** | Mobilité | DB + Entretien | "Pas de permis, dépend des autres" | Blocage administratif, motivation présente | Obtenir le permis B d'ici 6 mois via formation financée |
| **Socialisation** | Socialisation | Texte | "Isolement depuis 2 ans, peu de contacts" | Rupture relationnelle, ressources: association locale | Relancer contact avec 2 personnes et intégrer club sport en 3 mois |
| **Scolarité** | Scolarité/Formation | DB + Prompt | "Scolarité interrompue, intérêt pour informatique" | Potentiel non exploité, besoin formation | Intégrer formation informatique certifiée en 4 mois |
| **Emploi** | Emploi & activité | Prompt + Texte | "Recherche emploi depuis 6 mois, CV à refaire" | Compétences présentes mais non valorisées | Avoir CV actualisé et envoyer 5 candidatures/mois pendant 3 mois |
| **Santé** | Santé & soins | DB + Entretien | "Suivi médical irrégulier, antécédents dépression" | Nécessité d'ancrage, ressources: médecin traitant ok | RDV suivi médical 1x/mois, prendre traitement régulièrement |
| **Logement** | Logement | DB + Texte | "Logement instable, risque d'expulsion" | Urgence, ressources: CAF, accompagnement social | Stabiliser logement et maintenir 6 mois sans arriérés |

---

## 🎤 PROMPT DÉTAILLÉ - STRUCTURE POUR GÉNÉRER LE PPA

### **PARTIE 1: INFORMATIONS DE BASE** (du Prompt ou DB)
```
- Identifiant / Initiales de la personne
- Âge / Date de naissance
- Situation familiale / Composition du foyer
- Adresse / Localité
- Contact principal
- Date du PPA
- Professionnels impliqués
```

### **PARTIE 2: PRÉSENTATION DE LA SITUATION** (Analyse texte + DB)
Intégrer les informations du texte libre transcrit pour produire:
```
- Présentation générale (parcours, contexte actuel)
- Situation socio-familiale
- Situation professionnelle / formation
- Situation de santé
- Situation de logement
- Ressources identifiées
```

### **PARTIE 3: ANALYSE PAR AXE SÉRAPHIN** (Tableau + Analyse texte)
Pour chaque axe:
```
**[AXE]** (ex: Communication)
  - Observation actuelle (du texte + DB)
  - Ressources / Points d'appui (du texte + entretien)
  - Difficultés / Blocages (du texte + DB)
  - Potentiel d'évolution (analyse)
```

### **PARTIE 4: OBJECTIFS D'ACCOMPAGNEMENT** (Synthèse tableau)
Présenter les objectifs SMART pour chaque axe travaillé:
```
**OBJECTIF 1** - [AXE]
  - Description: (Spécifique)
  - Indicateurs de réussite: (Mesurable)
  - Actions concrètes: (Réaliste)
  - Délai: (Défini dans le temps)
  - Responsables: (Qui fait quoi)
```

### **PARTIE 5: MODALITÉS DE MISE EN ŒUVRE** (Du Prompt + décision)
```
- Fréquence des rencontres
- Lieux d'accompagnement
- Professionnels impliqués
- Partenaires externes
- Financements/ressources mobilisées
```

---

## 📝 PROCESSUS D'ANALYSE DE TEXTE LIBRE

### **Input: Textarea (Entretien transcrit ou texte manuscrit)**
```
L'utilisateur entre:
- Notes d'entretien brutes
- Transcription audio
- Observations manuscrites
- Témoignages directs
```

### **Processing: Analyse par Axe**
Pour chaque axe Séraphin, le système doit extraire:

1. **Données factuelles** (Qui? Quoi? Quand?)
2. **Ressources** (Compétences, leviers, soutiens)
3. **Difficultés** (Blocages, obstacles)
4. **Potentiel** (Capacités non exploitées)
5. **Motivations** (Envies, objectifs exprimés)

### **Output: Mapping structuré**
```
Texte brut → Parser par axe → Tableau structuré → Contenu PPA
```

---

## 🗂️ STRUCTURE DE FICHIER RECOMMANDÉE

```
PPA_[INITIALES]_[DATE]/
├── 01_DONNEES_BRUTES/
│   ├── prompt_questions.md
│   ├── extrait_base_donnees.xlsx
│   └── entretien_transcrit.txt
├── 02_ANALYSE_STRUCTUREE/
│   ├── tableau_axes_seraphin.xlsx
│   └── synthese_par_axe.md
└── 03_DELIVERABLE/
    ├── PPA_FINAL.md
    └── PPA_FINAL.pdf
```

---

## ⚙️ WORKFLOW - ÉTAPES DE GÉNÉRATION

### **Étape 1: Collecte des données**
- [ ] Informations de base (prompt)
- [ ] Données contextuelles (base de données)
- [ ] Entretien / observations (texte libre)

### **Étape 2: Extraction et structuration**
- [ ] Parser le texte libre par axe Séraphin
- [ ] Compléter le tableau de données
- [ ] Identifier ressources et difficultés
- [ ] Lister observations clés

### **Étape 3: Analyse et synthèse**
- [ ] Rédiger présentation de situation
- [ ] Développer analyse pour chaque axe
- [ ] Proposer objectifs SMART
- [ ] Intégrer modalités de mise en œuvre

### **Étape 4: Production du PPA**
- [ ] Générer document structuré
- [ ] Intégrer mentions légales/éthiques
- [ ] Formatter (MD → PDF si besoin)
- [ ] Validation et relecture

---

## 💡 PRINCIPES DE RÉDACTION PPA

✅ **À privilégier:**
- Langage professionnel, clair et accessible
- Posture centrée sur la personne
- Valorisation des ressources et capacités
- Objectifs progressifs et réalistes
- Mention du pouvoir d'agir et autodétermination

❌ **À éviter:**
- Listes à puces (format texte fluide)
- Termes stigmatisants ou réducteurs
- Objectifs trop ambitieux ou vagues
- Oubli des ressources et points d'appui
- Approche déficitaire uniquement

---

## 📊 EXEMPLE: TABLEAU COMPLET (1 personne)

| Axe | Observation | Ressources | Difficultés | Objectif SMART | Deadline |
|-----|-------------|-----------|------------|----------------|----------|
| **Communication** | "Manque confiance en elle, peu de parole" | Intérêt pour l'art, groupe de dessin existant | Timidité, vécu négatif scolaire | Participer à 1 atelier créatif/mois pendant 3 mois | Juin 2026 |
| **Mobilité** | "Dépendante des autres, vit sans permis" | Bonne santé physique, motivation | Coût de la formation, peur de l'examen | Obtenir permis B via formation subventionnée | Décembre 2026 |
| **Autonomie** | "Cuisine simple mais irrégulier" | Sait faire les courses, a budget | Manque de structure, absence de routine | Avoir menu planifié et faire 3 repas/jour avec aide 2x/sem | Juillet 2026 |
| **Socialisation** | "Isolée, peu d'amis proches" | Ancienne passion pour le foot | Rupture relationnelle, déménagement | Rejoindre club local + appel hebdo ami ancien | Mai 2026 |
| **Scolarité** | "Arrêt à 15 ans, regrets" | Curiosité pour admin/comptabilité | Blocage émotionnel, illettrisme partiel | Formation courte comptabilité (150h) validée | Octobre 2026 |
| **Emploi** | "Chômage 18 mois, démoralisation" | CV fourni, refs professionnelles ok | Confiance perdue, expérience métier datée | 5 candidatures/mois + 2 RDV "bilan de compétences" | Août 2026 |
| **Santé** | "Suivi irrégulier, prise poids" | Médecin traitant disponible | Anxiété, pas d'activité physique | RDV mensuel médecin + 1 activité sport/sem | Continu |
| **Logement** | "Logement précaire, HLM en attente" | CAF mobilisable, aide au logement ok | Arriérés loyer (3 mois), risque expulsion | Négocier délai CAF et rembourser arriérés en 6 mois | Septembre 2026 |

---

## 🔗 INTÉGRATION SYSTÈME: POINTS DE CONNEXION

### **Base de données → Prompt**
- Historique accompagnement
- Données administratives
- Statuts de droits sociaux
- Ressources locales mobilisables

### **Prompt → Analyse texte**
- Questions d'approfondissement
- Axes d'exploration spécifiques
- Ressources à identifier
- Objectifs suggérés

### **Analyse texte → Document PPA**
- Contenu principal (observations, ressources, difficultés)
- Verbatim pertinent (citations personnes)
- Analyse des motivations et potentiel
- Propositions d'objectifs concrets

---

## 🎯 CHECKLIST AVANT FINALISATION PPA

- [ ] Toutes les données nominatives anonymisées (ou accord explicite)
- [ ] 8 axes Séraphin couverts (au minimum 5)
- [ ] Objectifs SMART rédigés pour chaque axe travaillé
- [ ] Ressources identifiées ET valorisées
- [ ] Responsabilités claires (qui fait quoi)
- [ ] Délais définis de manière réaliste
- [ ] Langage professionnel et respectueux
- [ ] Mentions éthique/confidentialité incluses
- [ ] Partenaires/relais clairement nommés
- [ ] Modalités de suivi définies (fréquence, évaluation)

---

## 📚 DOCUMENTS DE RÉFÉRENCE

- **Prompt PPA** : `🧠 PROMPT PROJET PERSONNALISE SOCIAL.docx`
- **Axes Séraphin** : 8 domaines de vie à structurer
- **Framework SMART** : Objectifs mesurables et réalistes
- **Processus d'accompagnement** : Centré personne, éthique, réflexif

---

**Dernière mise à jour** : 2026-04-17  
**Version** : 1.0 - Framework complet PPA + Axes Séraphin
