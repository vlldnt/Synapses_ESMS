# 📋 GUIDE COMPLET - PPA MÉDICO-SOCIAL & SERAFIN-PH

**Document maître consolidé**  
**Généré:** 2026-04-17  
**Contexte:** Accompagnement personnalisé en structures médico-sociales (ESMS)  
**Framework:** Nomenclature SERAFIN-PH + Autodétermination de la personne

---

## 📚 TABLE DES MATIÈRES

1. [Résumé du contexte projet](#résumé-du-contexte-projet)
2. [Structure du PPA](#structure-du-ppa)
3. [Les 8 Axes SERAFIN-PH](#les-8-axes-serafin-ph)
4. [Prompt Détaillé pour Claude](#prompt-détaillé-pour-claude)
5. [Processus d'Analyse Étape par Étape](#processus-danalyse-étape-par-étape)
6. [Exemple Complet: Avant/Après](#exemple-complet-avantaprès)
7. [Checklist Qualité](#checklist-qualité-ppa)
8. [Conseils d'Utilisation](#conseils-dutilisation)

---

## 📋 RÉSUMÉ DU CONTEXTE PROJET

### Objectif Global

Créer des **Projets Personnalisés d'Accompagnement (PPA)** structurés et conformes pour :

- **SESSAD** (Services d'Éducation Spécialisée et de Soins À Domicile)
- Structures d'accueil de jour
- Structures d'accompagnement éducatif
- Services d'aide à domicile
- Structures de protection de l'enfance
- Services d'insertion et de logement

### Résultats Attendus

✅ PPA structurés selon **SERAFIN-PH**  
✅ Conformité **RGPD** et confidentialité totale  
✅ Cohérence besoins → objectifs → prestations  
✅ Suivi opérationnel et évaluable  
✅ Documents directement exploitables dans le dossier usager  

### À propos de SERAFIN-PH

**SERAFIN-PH** = Système d'Évaluation, de Classification et d'Analyse des Besoins de Proximité en Politique d'Aide à l'Autonomie

C'est la nomenclature officielle française qui identifie de manière précise et homogène :
- **Les besoins** de la personne (santé, autonomie, participation)
- **Les prestations** correspondantes (codes 2.x.x)
- **Les modalités** d'intervention

---

## 🏗️ STRUCTURE DU PPA

### Architecture Générale

```
PPA (Plan Personnalisé d'Accompagnement)
│
├─ AVERTISSEMENT IA
│  └─ Transparence et validation obligatoire
│
├─ IDENTIFICATION
│  ├─ Identité anonymisée
│  ├─ Date d'admission
│  ├─ Coordonnées des référents
│  └─ Partenaires externes
│
├─ EXPRESSION DE LA PERSONNE
│  └─ Désirs / Projets / Souhaits exprimés
│
├─ ANALYSE DES BESOINS
│  ├─ 8 axes SERAFIN (codes 1.x.x)
│  ├─ Observations factuelles
│  └─ Contexte situationnel
│
├─ OBJECTIFS D'ACCOMPAGNEMENT
│  ├─ Objectif général (vision long terme)
│  └─ Objectifs opérationnels (mesurables)
│
├─ PRESTATIONS SERAFIN-PH
│  ├─ Codes 2.x.x officiels
│  ├─ Actions concrètes
│  ├─ Responsables
│  └─ Fréquences et échéances
│
├─ TABLEAU RÉCAPITULATIF
│  └─ Synthèse Besoins → Objectifs → Prestations
│
├─ MODALITÉS D'ACCOMPAGNEMENT
│  ├─ Professionnels mobilisés
│  ├─ Lieux et fréquences
│  ├─ Supports éducatifs
│  └─ Partenaires impliqués
│
├─ PARTICIPATION DE LA PERSONNE
│  ├─ Préférences exprimées
│  └─ Autonomie décisionnelle respectée
│
└─ SUIVI & RÉÉVALUATION
   ├─ Critères d'évaluation concrets
   ├─ Fréquence de réévaluation
   └─ Modalités de suivi
```

---

## 🎯 LES 8 AXES SERAFIN-PH

### 1. COMMUNICATION & EXPRESSION
- **Code:** 1.1.2.x
- **Définition:** Capacités à comprendre, s'exprimer, communiquer
- **Besoins Types:**
  - Troubles du langage / expression verbale limitée
  - Compréhension des consignes
  - Utilisation d'outils de communication AAC (pictogrammes, etc.)
- **Prestations Associées:**
  - 2.1.2.1 Orthophonie/logopédie
  - 2.2.1.2 Accompagnement communication adaptée
  - Mise en place outils compensatoires

### 2. MOBILITÉ & DÉPLACEMENTS
- **Code:** 1.2.3.x
- **Définition:** Capacités de se mouvoir, se déplacer, accéder à l'environnement
- **Besoins Types:**
  - Limitation motricité globale
  - Déficit équilibre/coordination
  - Restrictions déplacements autonomes
- **Prestations Associées:**
  - 2.1.2.2 Kinésithérapie/rééducation
  - 2.2.2.1 Accompagnement déplacements
  - Aides techniques/adaptation environnement

### 3. AUTONOMIE QUOTIDIENNE
- **Code:** 1.2.1.1 à 1.2.1.4
- **Définition:** Capacités pour actes vie quotidienne (hygiène, alimentation, habillage, etc.)
- **Besoins Types:**
  - Autonomie toilette/hygiène
  - Autonomie alimentation
  - Gestion tenue vestimentaire
  - Gestion continence
- **Prestations Associées:**
  - 2.2.1.1 Accompagnement actes vie quotidienne
  - 2.2.1.1 Aide personnelle directe
  - Education aux gestes hygiéniques

### 4. SANTÉ & SOINS (Fonctions Mentales/Physiques)
- **Code:** 1.1.1.x & 1.1.3.x
- **Définition:** État de santé somatique & psychique, fonctions cognitives
- **Besoins Types:**
  - Troubles psychiques/anxiété
  - Déficits cognitifs (mémoire, attention, etc.)
  - Problèmes somatiques (douleurs, complications)
  - Épilepsie, troubles du sommeil
- **Prestations Associées:**
  - 2.1.1.1 Consultations médicales
  - 2.1.1.3 Suivi psychiatrique/psychologique
  - 2.1.1.3 Thérapies adaptées

### 5. SOCIALISATION & RELATIONS
- **Code:** 1.2.1.2 & 1.3.x
- **Définition:** Capacités de relation, intégration sociale, participation communautaire
- **Besoins Types:**
  - Isolement social
  - Difficulté relations avec autrui
  - Manque de participation sociale
  - Troubles comportementaux en groupe
- **Prestations Associées:**
  - 2.2.1.2 Accompagnement relations sociales
  - 2.3.3.2 Activités collectives/de groupe
  - 2.3.3.2 Inclusion en milieu ordinaire

### 6. SCOLARITÉ & FORMATION
- **Code:** 1.3.3.1
- **Définition:** Capacités de mener vie d'élève, d'apprendre, suivre formation
- **Besoins Types:**
  - Suivi difficulté scolaire
  - Besoin d'adaptation pédagogique
  - Orientation vers formation appropriée
  - Faible implication scolaire
- **Prestations Associées:**
  - 2.3.3.1 Soutien scolaire adapté
  - 2.3.3.1 Coordination avec enseignant/établissement
  - 2.3.3.1 Aide aux apprentissages

### 7. EMPLOI & ACTIVITÉ PROFESSIONNELLE
- **Code:** 1.3.3.4
- **Définition:** Capacités d'accès à emploi, activité, milieu professionnel
- **Besoins Types:**
  - Préparation à l'emploi
  - Développement compétences professionnelles
  - Besoin d'accompagnement emploi soutenu
  - Orientation professionnelle
- **Prestations Associées:**
  - 2.3.3.4 Préparation emploi
  - 2.3.3.4 Stage/formation professionnelle
  - 2.3.3.4 Accompagnement emploi soutenu

### 8. LOGEMENT & CADRE DE VIE
- **Code:** 1.2.1.1, 1.2.2.x
- **Définition:** Capacités de gérer son environnement, accès logement adapté
- **Besoins Types:**
  - Besoin d'un cadre de vie adapté
  - Gestion difficultés du quotidien au domicile
  - Isolation habituelle
  - Manque accessibilité
- **Prestations Associées:**
  - 2.2.1.1 Accompagnement quotidien adapté
  - 2.2.1.1 Aide à l'accès logement
  - Adaptation environnement

---

## 🤖 PROMPT DÉTAILLÉ POUR CLAUDE

### CONTEXTE GLOBAL

Vous êtes un assistant spécialisé en **rédaction de Plans Personnalisés d'Accompagnement (PPA)** pour structures médico-sociales (ESMS).

**Vos compétences:**
- ✅ Nomenclature SERAFIN-PH (codes précis et intitulés officiels)
- ✅ Logique besoins → objectifs → prestations
- ✅ Approche centrée personne et autodétermination
- ✅ Rédaction professionnelle claire et descriptive
- ✅ Respect cadre légal (Code action sociale et familles)

**Votre rôle:** Aider le professionnel à structurer les observations et produire un PPA conforme.

---

### RÈGLES OBLIGATOIRES

#### CONFIDENTIALITÉ & RGPD
• Aucun nom, prénom, adresse, date de naissance ou localisation précise
• Anonymisation totale et explicite
• Mention obligatoire en début : « ⚠️ Aide IA -- Validation professionnelle obligatoire »
• Mention obligatoire en fin : « Document généré avec aide IA -- à valider par le professionnel »

#### QUALITÉ RÉDACTIONNELLE
• Style professionnel, neutre et factuel
• Phrases complètes et construites, pas de listes à puces (sauf sections structurées)
• Langage clair, vocabulaire accessible, pas de jargon inutile
• Désigner la personne par : « la personne accompagnée », « l'usager », « l'accompagné(e) »
• Utiliser les formulations : « il a été observé que », « il apparaît que »

#### UTILISATION SERAFIN-PH
• Systématiquement utiliser les codes SERAFIN-PH officiels (ex: 2.1.1.1 / 2.2.3.1)
• Toujours inclure l'intitulé officiel complet associé au code
• Ne jamais inventer de codes - rester fidèle à la nomenclature
• Associer chaque besoin à une prestation identifiée

#### GESTION DES ACRONYMES
• Développer la première occurrence (ex: SESSAD = Services d'Éducation Spécialisée...)
• Utiliser l'acronyme seul par la suite
• Inclure : SERAFIN-PH, RGPD, AVS, APA, etc.

#### OBJECTIFS OPÉRATIONNELS
• Formuler des objectifs observables, réalistes et évaluables
• Respect strict des critères SMART (sans nommer explicitement)
• Durée : 6 à 12 mois maximum par objectif
• Privilégier des paliers progressifs et des réussites visibles
• Chaque action clairement attribuée avec responsable et échéance

---

### INSTRUCTIONS DE TRAITEMENT

#### ÉTAPE 1 : IDENTIFICATION DES BESOINS

Vous recevrez un texte (transcription orale, notes écrites, ou observation brute).

**À faire:**
1. **Identifier les faits observables** (pas de jugement)
   - ✅ Bon: "L'usager met 45 minutes pour sa toilette du matin"
   - ❌ Mauvais: "L'usager est lent"

2. **Catégoriser par axe SERAFIN-PH** selon les 8 domaines:
   - Communication
   - Mobilité & déplacements
   - Autonomie quotidienne
   - Santé & soins
   - Socialisation
   - Scolarité/Formation
   - Emploi & activité
   - Logement & cadre de vie

3. **Associer les codes SERAFIN** précis
   - Format: `[Code SERAFIN] - Intitulé officiel`
   - *Exemple:* `1.2.1.1 - Besoins pour les actes de la vie quotidienne`

4. **Extraire les souhaits/projets** de la personne (autodétermination)

#### ÉTAPE 2 : FORMULATION DES OBJECTIFS

Pour chaque besoin identifié, proposer:

**Objectif Général** (vision long terme)
- *Exemple:* "Améliorer l'autonomie en hygiène personnelle"

**Objectifs Opérationnels** (mesurables, réalistes, temporels)
- *Exemple:* "L'usager effectuera seul sa toilette matinale (avec rappels) d'ici 30/06/2026"
- ✅ Utiliser: "sera capable de", "effectuera", "augmentera", "acquerra"
- ❌ Éviter: "va mieux", "va progresser"

#### ÉTAPE 3 : IDENTIFICATION DES PRESTATIONS

Pour chaque objectif, proposer les prestations:

**Format:**
```
Axe: [AXE SERAFIN]
Besoin: [Code + Intitulé]
Prestation: [2.x.x.x - Intitulé officiel]
Action Concrète: [Description spécifique, fréquence, responsable]
Échéance: [Date réaliste]
```

**Exemples de Prestations SERAFIN (codes 2.x.x):**
- 2.1.1.1 - Consultations médicales
- 2.1.1.3 - Prestations des psychologues
- 2.1.2.1 - Orthophonie/logopédie
- 2.2.1.1 - Accompagnements pour les actes de la vie quotidienne
- 2.2.1.2 - Accompagnements pour la communication
- 2.3.3.1 - Accompagnements pour mener sa vie d'élève

#### ÉTAPE 4 : STRUCTURATION EN TABLEAU

Générer tableau synthétique:

```
| Axe | Besoin | Code SERAFIN | Objectif | Prestation | Responsable | Échéance |
|-----|--------|--------------|----------|-----------|-------------|----------|
```

#### ÉTAPE 5 : RÉDACTION NARRATIVE

Rédiger paragraphes professionnels:
- ✅ Factuel, descriptif, basé sur observations
- ✅ Termes appropriés (SERAFIN)
- ✅ Langage clair
- ✅ Cohérence interne
- ❌ Pas de jugements
- ❌ Pas de promesses non réalistes

---

## 🔍 PROCESSUS D'ANALYSE ÉTAPE PAR ÉTAPE

### Exemple Concret: Cas Simplifié

**TEXTE D'ENTRÉE (transcription orale):**

> "L'enfant arrive difficilement à suivre les consignes verbales simples. Il comprend mieux avec gestes. À la toilette, il refuse d'aller à la douche, il faut le forcer. Son hygiène générale est mauvaise. Il ne communique presque pas, juste quelques bruits. Il aimerait bien jouer avec les autres enfants mais il reste isolé. Il refuse d'aller à l'école l'année prochaine."

**ANALYSE ÉTAPE PAR ÉTAPE:**

| Étape | Action | Résultat |
|-------|--------|---------|
| **1. Faits observables** | Extraire observations | Difficulté consignes; Résistance douche; Vocalisations rares; Isolement; Refus scolarité |
| **2. Catégorisation SERAFIN** | Assigner à 8 axes | Communication (1.1.2.1), Autonomie (1.2.1.1), Santé (1.1.1.1), Socialisation (1.2.1.2), Scolarité (1.3.3.1) |
| **3. Codes précis** | Nomenclature exacte | 1.1.2.1, 1.2.1.1, 1.1.1.1, 1.2.1.2, 1.3.3.1 |
| **4. Objectifs** | Mesurables, réalistes | "Suivre consignes simples + geste d'ici 30/06/26" |
| **5. Prestations** | Codes 2.x.x + actions | 2.1.1.3 (psy), 2.2.1.1 (hygiène), 2.3.3.1 (scolarité) |
| **6. Tableau** | Compilation synthétique | 1 tableau 7 colonnes |
| **7. Rédaction** | Paragraphes professionnels | Texte clair, sans jugement |

---

## 📖 EXEMPLE COMPLET: AVANT/APRÈS

### ➡️ OBSERVATIONS DE TERRAIN (ENTRÉE)

```
Enfant de 8 ans, scolarisé en ULIS (classe pour l'inclusion scolaire).
Accompagné par le SESSAD depuis 2 ans.

Diagnostic : TSA (trouble du spectre autistique), léger.

Observations :
- Langage peu développé, tend à écholaliser et à utiliser des mots isolés
- Difficultés à maintenir le contact oculaire
- Anxiété élevée lors des transitions entre activités
- Besoin d'une structure visuelle pour se repérer dans le temps
- Actes d'hygiène : apporte spontanément les vêtements mais a besoin d'aide 
  pour l'ordre (chaussettes avant pantalon)
- Repas : manque de motricité fine, maladroite avec la fourchette
- Excellent avec les animaux, passionné par les jeux de lego
- Socialisation très limitée, joue seul
- Parents stressés, sentent qu'ils ne savent pas comment l'aider

Objectifs prioritaires selon les parents et l'école :
- Améliorer la communication
- Réduire l'anxiété lors des transitions
- Augmenter l'autonomie dans les actes d'hygiène
- Faciliter les interactions sociales (même basiques)

Ressources mobilisées : éducateur spécialisé, orthophoniste, psychologue
Fréquence actuelle : 2 séances d'1h30 par semaine au domicile + 1 séance 
à l'école.
```

### ⬅️ PROJET PERSONNALISÉ D'ACCOMPAGNEMENT GÉNÉRÉ (SORTIE)

---

#### **PROJET PERSONNALISÉ D'ACCOMPAGNEMENT (PPA)**

**⚠️ Aide IA -- Validation professionnelle obligatoire**

**Aucune donnée personnelle identifiable ne doit être utilisée dans ce document.**

---

##### **1. AVERTISSEMENT RELATIF À LA DÉMARCHE**

Ce document a été généré avec l'aide d'une intelligence artificielle, au titre d'outil d'aide à la rédaction. Le contenu final, son adoption et sa mise en œuvre restent sous l'entière responsabilité du professionnel ou de l'équipe qui en assurera l'actualisation et la révision. Tout élément nécessitant une correction ou une clarification doit être modifié avant la diffusion au dossier d'accompagnement.

---

##### **2. PRÉSENTATION SYNTHÉTIQUE DE LA SITUATION**

La personne accompagnée est un enfant de huit ans, actuellement scolarisé en classe pour l'inclusion scolaire (ULIS). Elle bénéficie depuis deux années d'un accompagnement par le SESSAD (Services d'Éducation Spécialisée et de Soins À Domicile).

Le diagnostic clinique identifie un trouble du spectre autistique (TSA) de léger à modéré. La personne accompagnée manifeste une capacité à se lier et à établir une relation avec les adultes de confiance, mais cet engagement reste limité. Elle possède un langage oral, bien que peu structuré, caractérisé par des répétitions et l'usage de termes isolés. Une motivation particulière apparaît dans les activités ludiques, notamment les jeux de construction et les interactions avec les animaux.

Les parents rapportent un sentiment de désorientation face aux besoins spécifiques et aux meilleures manières de soutenir leur enfant. Le cadre familial reste bienveillant, mais l'anxiété liée aux transitions quotidiennes crée des tensions récurrentes. L'équipe d'accompagnement souligne les ressources présentes : une capacité d'adaptation progressive, une relation positive avec les figures professionnelles et un environnement familial mobilisé.

---

##### **3. ANALYSE DES BESOINS SELON SERAFIN-PH**

**A. SANTÉ SOMATIQUE ET PSYCHIQUE**

La personne accompagnée manifeste une régulation émotionnelle fragile, particulièrement observable lors des transitions entre activités ou contextes différents. Une anxiété anticipatrice apparaît et peut se traduire par une agitation, une résistance ou un retrait. Il a été observé que la structuration temporelle (supports visuels, prédictibilité des événements) permet une meilleure régulation de cette anxiété.

Sur le plan sensoriel, il apparaît que la personne accompagnée est sensible à certains stimuli, notamment les changements inattendus ou l'absence de repères visuels. Aucun besoin urgent de soins somatiques n'a été identifié à ce stade. Cependant, l'accès à un suivi médical régulier (pédiatre, éventuellement un ophtalmologue pour vérifier l'absence de troubles sensoriels associés) est recommandé.

La sécurité de la personne et sa protection demeurent une priorité. Il apparaît que l'absence de conscience des dangers (circulation routière, approche d'animaux inconnus) nécessite une vigilance constante de la part des adultes.

**Code SERAFIN:** 1.1.1.1 - Besoins en lien avec les fonctions mentales, cognitives et nerveux

**B. AUTONOMIE**

Concernant l'hygiène personnelle, la personne accompagnée bénéficie d'une capacité partielle : elle approche spontanément les vêtements et manifeste une certaine conscience de l'action, mais elle requiert un accompagnement constant pour l'ordre et la séquence des gestes. Il en est de même pour l'hygiène de base (lavage des mains, brossage des dents), où la motivation existe mais l'autonomie complète fait défaut.

Dans les actes de la vie quotidienne, il a été observé qu'aux repas, la personne accompagnée manifeste un intérêt pour manger, mais elle manque de motricité fine et de coordination. L'usage de la fourchette ou de la cuillère reste imprécis ; elle aurait tendance à préférer manger avec les mains, ce qui est normal développementalement à son âge mais requiert un accompagnement progressif.

**Code SERAFIN:** 1.2.1.1 - Besoins pour les actes de la vie quotidienne

**C. COMMUNICATION**

Il s'agit d'un besoin particulièrement significatif. La personne accompagnée utilise un langage oral caractérisé par l'écholalie (répétition de paroles) et l'émission de mots isolés. La compréhension des consignes verbales est limitée et fragile. La communication alternative (images, pictogrammes) pourrait enrichir les modes d'expression et de compréhension.

**Code SERAFIN:** 1.1.2.1 - Besoins en lien avec la compréhension et l'expression

**D. APPRENTISSAGES FONCTIONNELS**

Il a été constaté que la personne accompagnée progresse lentement mais régulièrement lorsque l'enseignement est structuré, visuel et accompagné de renforts positifs. Les apprentissages restent toutefois lents et nécessitent une répétition fréquente.

**Code SERAFIN:** 1.3.3.1 - Besoins en lien avec la vie d'élève

**E. PARTICIPATION SOCIALE**

La participation sociale demeure actuellement très réduite. Il a été observé que la personne accompagnée joue seule, sans chercher à s'engager dans l'interaction avec d'autres enfants. Aucune relation amicale structurée n'existe à ce stade. Cependant, une capacité d'engagement auprès d'un adulte familier est présente, ce qui constitue un point de départ pour favoriser, progressivement, les interactions sociales.

Les loisirs de la personne accompagnée sont très orientés (jeux de construction, activités sensorielles, animaux). Il apparaît que ces intérêts spécifiques peuvent être mobilisés comme leviers éducatifs pour élargir progressivement les activités et les contextes de participation.

La vie collective demeure difficile : le respect des règles du groupe, l'anticipation des demandes d'attente, la tolérance de la proximité sensorielle d'autres personnes nécessitent un travail progressif et bienveillant.

**Code SERAFIN:** 1.2.1.2 - Besoins en lien avec les relations et interactions sociales

---

##### **4. PRESTATIONS SERAFIN-PH ASSOCIÉES**

**Prestation 2.1 -- Soins et développement des capacités**

- **Code 2.1.1.1 / Diagnostic, évaluation et suivi clinique:** suivi pédiatrique régulier, évaluations psychologiques périodiques pour adapter les interventions.
- **Code 2.1.1.3 / Prestations des psychologues:** soutien psychologique adapté au TSA, accompagnement des phases d'anxiété et de désorganisation, mise en place de stratégies de calme et de régulation.
- **Code 2.1.2.1 / Orthophonie:** accompagnement orthophonique ciblé sur la structuration de la parole, mise en place de systèmes de communication alternative.

**Prestation 2.2 -- Accompagnement à l'autonomie**

- **Code 2.2.1.1 / Accompagnement dans les actes d'hygiène:** guidage dans la toilette, le brossage des dents, l'habillage selon une séquence structurée. Utilisation de supports visuels (schémas, pictogrammes).
- **Code 2.2.1.1 / Accompagnement dans les actes de la vie domestique:** aide progressive à la table, aux repas. Travail sur la motricité fine (usage de la fourchette, cuillère) avec des outils adaptés (assiettes antidérapantes, couverts ergonomiques).
- **Code 2.2.1.2 / Accompagnement dans la communication:** mise en place d'un système de communication alternative et augmentée (pictogrammes, images).
- **Code 2.2.1.3 / Soutien aux apprentissages:** appui à la scolarité en ULIS, utilisation de supports visuels et concrets pour faciliter les apprentissages.

**Prestation 2.3 -- Participation sociale**

- **Code 2.3.3.2 / Participation aux loisirs:** utilisation des intérêts spécifiques (lego, animaux) pour favoriser des activités structurées et progressivement partagées.
- **Code 2.3.3.2 / Soutien aux relations et interactions sociales:** accompagnement progressif à l'interaction avec les pairs en contexte scolaire et extrascolaire.

---

##### **5. OBJECTIFS D'ACCOMPAGNEMENT**

**Objectif Principal (Global)**

La personne accompagnée augmentera progressivement son autonomie dans les actes de la vie quotidienne, améliorera sa régulation émotionnelle notamment lors des transitions, et développera ses capacités communicationnelles et sociales, dans le but de renforcer son bien-être, son engagement dans les apprentissages et sa participation à la vie familiale et scolaire.

**Objectifs Opérationnels (Spécifiques)**

*Objectif 1 - Autonomie dans les actes d'hygiène*

La personne accompagnée participera progressivement aux actes d'hygiène en s'appuyant sur un support visuel de séquence. Elle aura pu, au terme de six mois, se brosser les dents avec un guidage réduit (indication verbale seule) et accepter de l'eau dans le bain sans anxiété observable.

*Objectif 2 - Régulation émotionnelle lors des transitions*

La personne accompagnée utilisera un support visuel (emploi du temps pictographique) pour anticiper les changements d'activité. Elle manifestera une réduction observable de l'anxiété (moins d'agitation, plus de coopération) lors d'au moins 70% des transitions dans les contextes d'accompagnement.

*Objectif 3 - Communication structurée*

La personne accompagnée augmentera son recours à la communication par pictogrammes. Elle pourra exprimer un besoin basique (manger, boire, toilettes) en combinant au minimum deux pictogrammes ou gestes convenus. Son langage écholalique diminuera progressivement au profit de paroles plus fonctionnelles.

*Objectif 4 - Participation aux activités et interactions basiques*

La personne accompagnée participera à au moins une activité collective par semaine (groupe de jeu, activité loisir) avec accompagnement proche. Elle initialisera un premier contact social basique (regard, approche) avec un autre enfant ou un adulte nouvelle figure au moins une fois dans la semaine.

*Objectif 5 - Soutien à la parentalité*

Les parents acquerront les stratégies éducatives fondamentales (structuration visuelle, guidage, renforcement positif) et les reproduiront à domicile. Une diminution observée des tensions lors des routines quotidiennes sera constatée à domicile dans au moins 50% des situations.

---

##### **6. TABLEAU RÉCAPITULATIF DES OBJECTIFS**

| Objectif opérationnel | Prestation SERAFIN-PH | Responsable | Modalités | Fréquence | Échéance | Indicateurs d'évaluation |
|---|---|---|---|---|---|---|
| Autonomie dans les actes d'hygiène | 2.2.1.1 Accompagnement dans les actes d'hygiène | Éducateur spécialisé | Guidage structuré avec support pictographique, renforcements positifs | 2 séances/semaine au domicile | 6 mois | Brossage des dents avec guidage réduit (verbal) ; acceptation de l'eau sans anxiété observable |
| Régulation émotionnelle lors des transitions | 2.1.1.3 Soutien à la régulation émotionnelle | Psychologue + Éducateur | Emploi du temps visuel, préparation verbale, technique de calme (respiration) | Intégré à chaque séance | 6 mois | Réduction de l'agitation à 70% des transitions ; augmentation de la coopération |
| Communication structurée | 2.2.1.2 Accompagnement dans la communication | Orthophoniste + Éducateur | Pictogrammes, gestes convenus, activités communicationnelles ludiques | 1-2 séances orthophonie/semaine + intégration éducative | 6-8 mois | Expression d'un besoin par 2+ pictogrammes ; diminution de l'écholalie ; augmentation de la parole fonctionnelle |
| Participation aux activités et interactions sociales | 2.3.3.2 Participation aux loisirs et soutien aux relations | Éducateur spécialisé | Activités loisir structurées (lego, animaux) en petit groupe ou duo ; facilitation des interactions | 1-2 activités/semaine | 8-12 mois | Participation autonome à 1 activité collective ; initiation de contact basique 1x/semaine |
| Soutien à la parentalité | 2.2.1.3 Soutien à la parentalité | Éducateur + Psychologue | Formations pratiques (démonstration, co-intervention), fiches consignes, débriefing régulier | 1 séance spécifique/mois + mensuel | 12 mois | Parents reproduisent les stratégies : diminution des tensions à domicile (50% des routines) |

---

##### **7. MODALITÉS D'ACCOMPAGNEMENT**

**Professionnels Mobilisés**

L'accompagnement sera assuré conjointement par l'équipe du SESSAD (éducateur spécialisé, psychologue) et coordonné avec l'école (enseignant spécialisé en ULIS). Un suivi orthophonique sera maintenu en articulation avec les interventions éducatives. Les parents sont les partenaires clés et seront impliqués dans chaque modalité.

**Fréquence et Lieux d'Intervention**

Les interventions se déploient selon plusieurs contextes : deux séances hebdomadaires d'une heure trente au domicile (éducateur spécialisé + psychologue alternativement), une séance de coordination et d'observation à l'école en ULIS (éducateur spécialisé), des rendez-vous réguliers d'orthophonie (un à deux par semaine selon les ressources disponibles).

**Supports Éducatifs**

Plusieurs supports seront mobilisés : des pictogrammes et images pour la communication alternative, un emploi du temps visuel pour la structuration temporelle (images plastifiées, tableau magnétique), des guides de séquences pour l'hygiène (photos de l'enfant en train de faire les gestes), des outils sensoriels pour la régulation (petite salle sensorielle, jeux de détente), une liste de renforts positifs adaptés à l'enfant (autocollants, activités de lego).

**Coordination avec les Partenaires**

Une réunion de coordination sera organisée chaque trimestre avec l'école et les parents pour harmoniser les pratiques. Les échanges entre l'éducateur et l'orthophoniste se feront mensuellement pour assurer la cohérence des approches communicationnelles.

---

##### **8. PARTICIPATION DE LA PERSONNE ACCOMPAGNÉE**

La personne accompagnée sera progressivement invitée à exprimer ses préférences et ses choix, notamment dans le choix des activités et des renforcements positifs. Bien que l'expression verbale soit limitée, son consentement sera recherché par des moyens adaptés (signes non verbaux, pictogrammes).

Les parents ont exprimé leurs préférences quant aux domaines prioritaires : autonomie dans l'hygiène, diminution de l'anxiété et ouverture progressive aux interactions sociales. Ces priorités guident les objectifs du PPA.

---

##### **9. SUIVI ET RÉÉVALUATION**

**Critères d'Évaluation**

L'évaluation du projet s'appuiera sur des critères concrets et observables : la fréquence et la qualité de l'utilisation des supports visuels, la diminution mesurable de l'agitation lors des transitions, le nombre et la pertinence des énoncés communicationnels (au-delà de l'écholalie), le nombre de participations à des activités, la qualité des interactions sociales (regard, approche, échange).

Les parents et l'équipe scolaire seront consultés régulièrement pour ajuster les observations et valider les progressions.

**Fréquence de Réévaluation**

Une première évaluation intermédiaire sera réalisée après trois mois, permettant d'ajuster rapidement les stratégies si nécessaire. Une évaluation complète sera conduite tous les six mois, donnant lieu à une révision formelle du PPA. Annuellement, une rencontre multi-partenaires (parents, école, SESSAD) permettra de formaliser les évolutions et de (re)définir les priorités.

**Modalités de Suivi**

Les éducateurs et la psychologue tiendront à jour un carnet de bord simple (notes courtes, grille de suivi) sur les progrès observés à chaque séance. Les parents seront invités à partager leurs observations entre les séances. L'école transmettra des rapports d'étape tous les deux mois.

---

##### **10. CONCLUSION**

Ce projet personnalisé d'accompagnement vise à soutenir la personne accompagnée dans son parcours de développement, en s'appuyant sur ses forces (capacité à s'engager avec les adultes, intérêts spécifiques) et en répondant à ses besoins clés (régulation émotionnelle, autonomie, communication, participation sociale).

L'implication conjointe du SESSAD, de l'école et de la famille constitue un levier majeur de progression. L'utilisation systématique de supports visuels et la cohérence des approches éducatives favoriseront une progression durable.

Le projet sera révisé dans six mois, avec une évaluation complète annuelle. Toute modification significative de la situation (nouveau diagnostic, changement scolaire, crise familiale) pourra justifier une révision anticipée du PPA.

---

**Document généré avec aide IA -- à valider par le professionnel avant toute diffusion au dossier d'accompagnement.**

---

---

## ✅ CHECKLIST QUALITÉ PPA

Avant de valider votre PPA, vérifiez:

- [ ] **Avertissement IA présent** (début + fin du document)
- [ ] **Données identité anonymisées** correctement
- [ ] **Souhaits personne documentés** (autodétermination)
- [ ] **Tous les besoins codifiés SERAFIN** (1.x.x précis)
- [ ] **Intitulés officiels SERAFIN inclus** pour chaque code
- [ ] **Objectifs mesurables et temporels** (pas de vague)
- [ ] **Prestations avec codes 2.x.x** (nomenclature officielle)
- [ ] **Actions concrètes explicitées** (fréquence, responsable)
- [ ] **Échéances réalistes** fixées et cohérentes
- [ ] **Tableau synthétique complet** (7 colonnes min.)
- [ ] **Langage professionnel clair** (pas de jugements)
- [ ] **Responsabilités clarifiées** (qui fait quoi)
- [ ] **Suivi défini** (réunions, indicateurs)
- [ ] **Cohérence interne** (besoins → objectifs → prestations alignés)
- [ ] **Mentions légales IA** présentes et claires
- [ ] **Pas d'éléments identifiants** (noms, adresses, références précises)

---

## 💡 CONSEILS D'UTILISATION

### Quand utiliser ce guide

✅ À la création du PPA ou lors d'une révision annuelle  
✅ Pour structurer les observations et analyses des professionnels  
✅ Pour assurer la conformité avec la nomenclature SERAFIN-PH  
✅ Pour générer un document directement exploitable et conforme  

### Comment utiliser avec Claude

1. **Copiez ce guide dans votre contexte Claude**
2. **Préparez vos observations brutes** (anonymisées)
3. **Posez votre question:**

```
J'ai l'observation suivante à transformer en PPA:

[VOTRE TEXTE D'OBSERVATION ANONYMISÉ]

Peux-tu:
1. Identifier les besoins selon SERAFIN-PH
2. Proposer des objectifs opérationnels mesurables
3. Associer les prestations adaptées (codes 2.x.x)
4. Générer un tableau synthétique
5. Rédiger le PPA complet en suivant la structure fournie
```

### Quand relire et adapter

⚠️ **Validation professionnelle obligatoire** avant toute diffusion au dossier usager  
⚠️ Vérifier l'anonymisation complète et l'absence d'identifiants  
⚠️ Adapter les codes SERAFIN-PH selon la réalité (la nomenclature est riche)  
⚠️ Personnaliser les objectifs et modalités selon le contexte  
⚠️ Assurer la cohérence besoins → prestations → objectifs  

### Points d'attention essentiels

**Anonymisation:** Vérifier qu'aucun élément identifiant ne reste (nom, prénom, adresse)

**SERAFIN-PH:** S'approprier les codes officiels et ne pas les inventer

**Spécificité:** Adapter le PPA à la réalité unique de chaque personne

**Réalisme:** Assurer que les objectifs et échéances sont réalistes

**Coordination:** Assurer la cohérence avec les autres documents du dossier

**Actualisation:** Prévoir des dates de révision claires

---

## 📚 RÉFÉRENCES RAPIDES

### Codes SERAFIN Fréquents - BESOINS (1.x.x)

```
SANTÉ (1.1.x)
├─ 1.1.1.1 - Besoins mentaux/cognitifs/nerveux
├─ 1.1.2.1 - Besoins communication/expression
└─ 1.1.3.1 - Besoins somatiques/physiques

AUTONOMIE (1.2.x)
├─ 1.2.1.1 - Actes vie quotidienne
├─ 1.2.1.2 - Relations/interactions sociales
├─ 1.2.1.3 - Sécurité/décisions
└─ 1.2.3.1 - Mobilité/déplacements

PARTICIPATION (1.3.x)
├─ 1.3.3.1 - Vie scolaire
├─ 1.3.3.3 - Loisirs/vie culturelle
└─ 1.3.3.4 - Vie professionnelle
```

### Codes SERAFIN Fréquents - PRESTATIONS (2.x.x)

```
SOINS (2.1.x)
├─ 2.1.1.1 - Médecine générale/diagnostic
├─ 2.1.1.3 - Psychologie/psychiatrie
└─ 2.1.2.1 - Orthophonie/logopédie

ACCOMPAGNEMENT (2.2.x)
├─ 2.2.1.1 - Actes vie quotidienne
├─ 2.2.1.2 - Relations/communication
└─ 2.2.2.1 - Transports

INCLUSION/PARTICIPATION (2.3.x)
├─ 2.3.3.1 - Accompagnement scolaire
├─ 2.3.3.3 - Loisirs/culture
└─ 2.3.3.4 - Emploi
```

---

**Document de référence -- À adapter selon les besoins spécifiques de chaque contexte.**

**Généré:** 2026-04-17 | **Version:** 1.0 - Consolidated | **Licence:** Libre d'usage en contexte médico-social
