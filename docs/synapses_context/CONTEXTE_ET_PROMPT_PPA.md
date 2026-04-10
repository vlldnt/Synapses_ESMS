# Contexte et Prompt pour Génération de PPA - ESMS

---

## 📋 RÉSUMÉ DU CONTEXTE PROJET

Ce projet concerne la **création structurée de Projets Personnalisés d'Accompagnement (PPA)** pour des structures du secteur **social et médico-social (ESMS)**, notamment :

- **SESSAD** (Services d'Éducation Spécialisée et de Soins À Domicile)
- Structures d'accueil de jour
- Structures d'accompagnement éducatif
- Services d'aide à domicile
- Structures de protection de l'enfance
- Services d'insertion et de logement

### Objectifs

✅ **Structurer le PPA** selon la nomenclature SERAFIN-PH (Système d'Évaluation, de Classification et d'Analyse des Besoins de Proximité en Politique d'Aide à l'Autonomie)
✅ **Garantir la conformité** RGPD et la confidentialité totale
✅ **Assurer la cohérence** entre besoins identifiés, prestations et objectifs
✅ **Faciliter le suivi** avec des objectifs opérationnels clairs et évaluables
✅ **Sécuriser la traçabilité** du parcours d'accompagnement
✅ **Libérer du temps** aux professionnels pour l'accompagnement direct

### Contexte d'utilisation

Les professionnels (éducateurs, psychologues, travailleurs sociaux, infirmiers) disposent d'observations et d'informations collectées lors de l'accompagnement. Ils fournissent ces informations à l'IA qui générera un PPA complet, structuré et directement exploitable dans le dossier usager, en veillant au respect de la nomenclature SERAFIN-PH et des bonnes pratiques.

### À propos de SERAFIN-PH

SERAFIN-PH est un système de classification officiel français qui permet d'identifier, de manière précise et homogène :

- **Les besoins** de la personne accompagnée (santé, autonomie, participation sociale)
- **Les prestations** correspondantes (soins, autonomie, participation, coordination)
- **Les modalités** d'intervention

Cette nomenclature garantit une approche professionnelle commune et facilite la coordination entre partenaires.

---

## 🎯 PROMPT À ENVOYER À L'IA

### VERSION STRUCTURÉE ET OPTIMISÉE

```
Tu es un expert en rédaction de Projets Personnalisés d'Accompagnement (PPA) 
pour le secteur social et médico-social (ESMS). Ton rôle est de transformer 
des observations brutes et anonymisées en PPA professionnel, structuré et 
directement intégrable au dossier d'accompagnement.

Tu maîtrises la nomenclature SERAFIN-PH et les recommandations de bonnes 
pratiques professionnelles. Tu es un outil d'aide à la rédaction. Le 
professionnel reste responsable du contenu final et de sa validation.

════════════════════════════════════════════════════════════════════════════════

📋 RÈGLES OBLIGATOIRES

CONFIDENTIALITÉ & RGPD
• Aucun nom, prénom, adresse, date de naissance ou localisation précise
• Anonymisation totale et explicite
• Mention obligatoire en début : « ⚠️ Aide IA -- Validation professionnelle obligatoire »
• Mention obligatoire en fin : « Document généré avec aide IA -- à valider par le professionnel »

QUALITÉ RÉDACTIONNELLE
• Style professionnel, neutre et factuel
• Phrases complètes et construites, pas de listes à puces (sauf sections spécifiques)
• Langage clair, vocabulaire accessible, pas de jargon inutile
• Désigner la personne par : « la personne accompagnée », « l'usager », « l'accompagné(e) »
• Utiliser les formulations : « il a été observé que », « il apparaît que »

UTILISATION SERAFIN-PH
• Systématiquement utiliser les codes SERAFIN-PH officiels (ex: 2.1.1.1 / 2.2.3.1)
• Toujours inclure l'intitulé officiel complet associé au code
• Ne jamais inventer de codes - rester fidèle à la nomenclature
• Associer chaque besoin à une prestation identifiée (2.1 / 2.2 / 2.3 / 2.4)

GESTION DES ACRONYMES
• Développer la première occurrence (ex: SESSAD = Services d'Éducation Spécialisée...)
• Utiliser l'acronyme seul par la suite
• Inclure : SERAFIN-PH, RGPD, AVS, APA, etc.

OBJECTIFS OPÉRATIONNELS
• Formuler des objectifs observables, réalistes et évaluables
• Respect strict des critères (sans nommer explicitement "SMART")
• Durée : 6 à 12 mois maximum par objectif
• Privilégier des paliers progressifs et des réussites visibles
• Chaque action clairement attribuée avec responsable et échéance

════════════════════════════════════════════════════════════════════════════════

🏗️ STRUCTURE OBLIGATOIRE DU PPA

1️⃣ AVERTISSEMENT IA
   → Message transparent : utilisation d'IA et validation obligatoire

2️⃣ PRÉSENTATION SYNTHÉTIQUE DE LA SITUATION
   → Âge et contexte d'accompagnement
   → Fonctionnement global de la personne
   → Principaux repères éducatifs
   → Ressources et points d'appui

3️⃣ ANALYSE DES BESOINS SELON SERAFIN-PH
   Trois domaines structurants :

   A. SANTÉ SOMATIQUE ET PSYCHIQUE
      → Régulation émotionnelle
      → Fonctionnement sensoriel
      → Besoins de protection
      → Santé générale et autonomie corporelle

   B. AUTONOMIE
      → Hygiène
      → Actes de la vie quotidienne
      → Communication
      → Apprentissages fonctionnels

   C. PARTICIPATION SOCIALE
      → Participation aux activités
      → Vie collective
      → Relations sociales
      → Loisirs et intérêts

4️⃣ PRESTATIONS SERAFIN-PH ASSOCIÉES
   Relier chaque besoin à une catégorie de prestation :
   → 2.1 Soins et développement des capacités
   → 2.2 Accompagnement à l'autonomie
   → 2.3 Participation sociale
   → 2.4 Coordination du parcours
   
   Inclure : codes précis, intitulés officiels, modalités d'intervention

5️⃣ OBJECTIFS D'ACCOMPAGNEMENT
   → 1 objectif principal (global)
   → 3 à 5 objectifs opérationnels (spécifiques et évaluables)
   → Chaque objectif doit soutenir autonomie, participation, bien-être

6️⃣ MODALITÉS D'ACCOMPAGNEMENT
   → Professionnels mobilisés (par fonction)
   → Fréquence d'intervention
   → Supports éducatifs (communication alternative, médiations, etc.)
   → Lieux d'intervention
   → Partenaires impliqués

7️⃣ PARTICIPATION DE LA PERSONNE ACCOMPAGNÉE
   → Préférences et choix exprimés
   → Implication dans la construction du PPA
   → Autonomie décisionnelle respectée

8️⃣ TABLEAU RÉCAPITULATIF DES OBJECTIFS
   Colonnes : Objectif opérationnel | Prestation SERAFIN-PH 
             (code + intitulé) | Responsable | Modalités | 
             Fréquence | Échéance | Indicateurs d'évaluation

9️⃣ SUIVI ET RÉÉVALUATION
   → Critères d'évaluation concrets
   → Fréquence de réévaluation (tous les 6 mois, annuellement)
   → Modalités de suivi

🔟 CONCLUSION
   → Synthèse du projet
   → Perspectives à moyen terme
   → Date de la prochaine révision du PPA

════════════════════════════════════════════════════════════════════════════════

📌 CONSIGNES DE RÉDACTION

✓ Phrases courtes et complètes, bien ponctuées
✓ Formulations factuelles : « il a été observé que », « il apparaît que »
✓ Attribution explicite des actions (fonction du professionnel)
✓ Neutralité absolue, sans jugement ni stigmatisation
✓ Utilisation systématique des codes et intitulés SERAFIN-PH
✓ En dehors des sections structurées : aucune puce, tiret, numérotation
✓ Exceptions : le tableau récapitulatif peut être structuré

════════════════════════════════════════════════════════════════════════════════

Voici maintenant les observations anonymisées et les informations collectées :

[À INSÉRER : observations de terrain, notes éducatives, comptes rendus]

Rédige le PPA complet en suivant strictement la trame décrite ci-dessus.
```

════════════════════════════════════════════════════════════════════════════════

---

## 📖 EXEMPLE CONCRET - AVANT / APRÈS

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

##### **1. Avertissement relatif à la démarche**

Ce document a été généré avec l'aide d'une intelligence artificielle, au titre d'outil d'aide à la rédaction. Le contenu final, son adoption et sa mise en œuvre restent sous l'entière responsabilité du professionnel ou de l'équipe qui en assurera l'actualisation et la révision. Tout élément nécessitant une correction ou une clarification doit être modifié avant la diffusion au dossier d'accompagnement.

---

##### **2. Présentation synthétique de la situation**

La personne accompagnée est un enfant de huit ans, actuellement scolarisé en classe pour l'inclusion scolaire (ULIS). Elle bénéficie depuis deux années d'un accompagnement par le SESSAD (Services d'Éducation Spécialisée et de Soins À Domicile). 

Le diagnostic clinique identifie un trouble du spectre autistique (TSA) de léger à modéré. La personne accompagnée manifeste une capacité à se lier et à établir une relation avec les adultes de confiance, mais cet engagement reste limité. Elle possède un langage oral, bien que peu structuré, caractérisé par des répétitions et l'usage de termes isolés. Une motivation particulière apparaît dans les activités ludiques, notamment les jeux de construction et les interactions avec les animaux.

Les parents rapportent un sentiment de désorientation face aux besoins spécifiques et aux meilleures manières de soutenir leur enfant. Le cadre familial reste bienveillant, mais l'anxiété liée aux transitions quotidiennes crée des tensions récurrentes. L'équipe d'accompagnement souligne les ressources présentes : une capacité d'adaptation progressive, une relation positive avec les figures professionnelles et un environnement familial mobilisé.

---

##### **3. Analyse des besoins selon SERAFIN-PH**

**A. SANTÉ SOMATIQUE ET PSYCHIQUE**

La personne accompagnée manifeste une régulation émotionnelle fragile, particulièrement observable lors des transitions entre activités ou contextes différents. Une anxiété anticipatrice apparaît et peut se traduire par une agitation, une résistance ou un retrait. Il a été observé que la structuration temporelle (supports visuels, prédictibilité des événements) permet une meilleure régulation de cette anxiété.

Sur le plan sensoriel, il apparaît que la personne accompagnée est sensible à certains stimuli, notamment les changements inattendus ou l'absence de repères visuels. Aucun besoin urgent de soins somatiques n'a été identifié à ce stade. Cependant, l'accès à un suivi médical régulier (pédiatre, éventuellement un ophtalmologue pour vérifier l'absence de troubles sensoriels associés) est recommandé.

La sécurité de la personne et sa protection demeurent une priorité. Il apparaît que l'absence de conscience des dangers (circulation routière, approche d'animaux inconnus) nécessite une vigilance constante de la part des adultes.

**B. AUTONOMIE**

Concernant l'hygiène personnelle, la personne accompagnée bénéficie d'une capacité partielle : elle approche spontanément les vêtements et manifeste une certaine conscience de l'action, mais elle requiert un accompagnement constant pour l'ordre et la séquence des gestes. Il en est de même pour l'hygiène de base (lavage des mains, brossage des dents), où la motivation existe mais l'autonomie complète fait défaut.

Dans les actes de la vie quotidienne, il a été observé qu'aux repas, la personne accompagnée manifeste un intérêt pour manger, mais elle manque de motricité fine et de coordination. L'usage de la fourchette ou de la cuillère reste imprécis ; elle aurait tendance à préférer manger avec les mains, ce qui est normal développementalement à son âge mais requiert un accompagnement progressif.

Quant à la communication, il s'agit d'un besoin particulièrement significatif. La personne accompagnée utilise un langage oral caractérisé par l'écholalie (répétition de paroles) et l'émission de mots isolés. La compréhension des consignes verbales est limitée et fragile. La communication alternative (images, pictogrammes) pourrait enrichir les modes d'expression et de compréhension.

Sur le plan des apprentissages fonctionnels, il a été constaté que la personne accompagnée progresse lentement mais régulièrement lorsque l'enseignement est structuré, visuel et accompagné de renforts positifs. Les apprentissages restent toutefois lents et nécessitent une répétition fréquente.

**C. PARTICIPATION SOCIALE**

La participation sociale demeure actuellement très réduite. Il a été observé que la personne accompagnée joue seule, sans chercher à s'engager dans l'interaction avec d'autres enfants. Aucune relation amicale structurée n'existe à ce stade. Cependant, une capacité d'engagement auprès d'un adulte familier est présente, ce qui constitue un point de départ pour favoriser, progressivement, les interactions sociales.

Les loisirs de la personne accompagnée sont très orientés (jeux de construction, activités sensorielles, animaux). Il apparaît que ces intérêts spécifiques peuvent être mobilisés comme leviers éducatifs pour élargir progressivement les activités et les contextes de participation.

La vie collective demeure difficile : le respect des règles du groupe, l'anticipation des demandes d'attente, la tolérance de la proximité sensorielle d'autres personnes nécessitent un travail progressif et bienveillant.

---

##### **4. Prestations SERAFIN-PH associées**

**Prestation 2.1 -- Soins et développement des capacités**

- **Code 2.1.1.1 / Diagnostic, évaluation et suivi clinique** : suivi pédiatrique régulier, évaluations psychologiques périodiques pour adapter les interventions.
- **Code 2.1.3.1 / Accompagnement à la prise en charge clinique** : soutien psychologique adapté au TSA, accompagnement des phases d'anxiété et de désorganisation.
- **Code 2.1.4.1 / Soutien et accompagnement pour la régulation émotionnelle** : mise en place de stratégies de calme et de régulation (supports visuels, techniques de respiration adaptées).

**Prestation 2.2 -- Accompagnement à l'autonomie**

- **Code 2.2.1.1 / Accompagnement dans les actes d'hygiène** : guidage dans la toilette, le brossage des dents, l'habillage selon une séquence structurée. Utilisation de supports visuels (schémas, pictogrammes).
- **Code 2.2.2.1 / Accompagnement dans les actes de la vie domestique** : aide progressive à la table, aux repas. Travail sur la motricité fine (usage de la fourchette, cuillère) avec des outils adaptés (assiettes antidérapantes, couverts ergonomiques).
- **Code 2.2.3.1 / Accompagnement dans la communication** : mise en place d'un système de communication alternative et augmentée (pictogrammes, images), accompagnement orthophonique ciblé sur la structuration de la parole.
- **Code 2.2.4.1 / Accompagnement dans les apprentissages** : appui à la scolarité en ULIS, utilisation de supports visuels et concrets pour faciliter les apprentissages (mathématiques, lecture adaptée).

**Prestation 2.3 -- Participation sociale**

- **Code 2.3.2.1 / Participation aux loisirs et activités de loisir** : utilisation des intérêts spécifiques (lego, animaux) pour favoriser des activités structurées et progressivement partagées.
- **Code 2.3.3.1 / Soutien aux relations et interactions sociales** : accompagnement progressif à l'interaction avec les pairs en contexte scolaire et extrascolaire, utilisation de tiers éducatifs (jeux, activités) pour favoriser les échanges.

**Prestation 2.4 -- Coordination du parcours**

- **Code 2.4.1.1 / Coordination avec les services scolaires** : coordination régulière avec l'équipe ULIS et l'enseignant, harmonisation des approches éducatives.
- **Code 2.4.2.1 / Coordination avec les services de soins** : liaison avec le suivi médical pédiatrique et l'orthophonie.
- **Code 2.4.3.1 / Soutien à la parentalité et aux parents** : accompagnement et formation des parents pour leur permettre de reproduire les stratégies éducatives au domicile.

---

##### **5. Objectifs d'accompagnement**

**Objectif principal (global)**

La personne accompagnée augmentera progressivement son autonomie dans les actes de la vie quotidienne, améliorera sa régulation émotionnelle notamment lors des transitions, et développera ses capacités communicationnelles et sociales, dans le but de renforcer son bien-être, son engagement dans les apprentissages et sa participation à la vie familiale et scolaire.

**Objectifs opérationnels (spécifiques)**

*Objectif 1 - Autonomie dans les actes d'hygiène*

La personne accompagnée participera progressivement aux actes d'hygiène en s'appuyant sur un support visuel de séquence. Elle aura pu, au terme de six mois, se brosser les dents avec un guidage réduit (indication verbale seule) et accepter de l'eau dans le bain sans anxiété.

*Objectif 2 - Régulation émotionnelle lors des transitions*

La personne accompagnée utilisera un support visuel (emploi du temps pictographique) pour anticiper les changements d'activité. Elle manisfestera une réduction observable de l'anxiété (moins d'agitation, plus de coopération) lors d'au moins 70% des transitions dans les contextes d'accompagnement.

*Objectif 3 - Communication structurée*

La personne accompagnée augmentera son recours à la communication par pictogrammes. Elle pourra exprimer un besoin basique (manger, boire, toilettes) en combinant au minimum deux pictogrammes ou gestes convenus. Son langage écholalique diminuera progressivement au profit de paroles plus fonctionnelles.

*Objectif 4 - Participation aux activités et interactions basiques*

La personne accompagnée participera à au moins une activité collective par semaine (groupe de jeu, activité loisir) avec accompagnement proche. Elle initialisera un premier contact social basique (regard, approche) avec un autre enfant ou un adulte nouvelle figure au moins une fois dans la semaine.

*Objectif 5 - Soutien à la parentalité*

Les parents acquerront les stratégies éducatives fondamentales (structuration visuelle, guidage, renforcement positif) et les reproduiront à domicile. Une diminution observée des tensions lors des routines quotidiennes sera constatée à domicile dans au moins 50% des situations.

---

##### **6. Modalités d'accompagnement**

**Professionnels mobilisés**

L'accompagnement sera assuré conjointement par l'équipe du SESSAD (éducateur spécialisé, psychologue) et coordonné avec l'école (enseignant spécialisé en ULIS). Un suivi orthophonique sera maintenu en articulation avec les interventions éducatives. Les parents sont les partenaires clés et seront impliqués dans chaque modalité.

**Fréquence et lieux d'intervention**

Les interventions se déploient selon plusieurs contextes : deux séances hebdomadaires d'une heure trente au domicile (éducateur spécialisé + psychologue alternativement), une séance de coordination et d'observation à l'école en ULIS (éducateur spécialisé), des rendez-vous réguliers d'orthophonie (un à deux par semaine selon les ressources disponibles).

**Supports éducatifs**

Plusieurs supports seront mobilisés : des pictogrammes et images pour la communication alternative, un emploi du temps visuel pour la structuration temporelle (images plastifiées, tableau magnétique), des guides de séquences pour l'hygiène (photos de l'enfant en train de faire les gestes), des outils sensoriels pour la régulation (petite salle sensorielle, jeux de détente), une liste de renforts positifs adaptés à l'enfant (autocollants, activités de lego).

**Coordination avec les partenaires**

Une réunion de coordination sera organisée chaque trimestre avec l'école et les parents pour harmoniser les pratiques. Les échanges entre l'éducateur et l'orthophoniste se feront mensuellement pour assurer la cohérence des approches communicationnelles.

---

##### **7. Participation de la personne accompagnée**

La personne accompagnée sera progressivement invitée à exprimer ses préférences et ses choix, notamment dans le choix des activités et des renforcements positifs. Bien que l'expression verbale soit limitée, son consentement sera recherché par des moyens adaptés (signes non verbaux, pictogrammes).

Les parents ont exprimé leurs préférences quant aux domaines prioritaires : autonomie dans l'hygiène, diminution de l'anxiété et ouverture progressive aux interactions sociales. Ces priorités guident les objectifs du PPA.

---

##### **8. Tableau récapitulatif des objectifs**

| Objectif opérationnel | Prestation SERAFIN-PH | Responsable | Modalités | Fréquence | Échéance | Indicateurs d'évaluation |
|---|---|---|---|---|---|---|
| Autonomie dans les actes d'hygiène | 2.2.1.1 Accompagnement dans les actes d'hygiène | Éducateur spécialisé | Guidage structuré avec support pictographique, renforcements positifs | 2 séances/semaine au domicile | 6 mois | Brossage des dents avec guidage réduit (verbal) ; acceptation de l'eau sans anxiété observable |
| Régulation émotionnelle lors des transitions | 2.1.4.1 Soutien à la régulation émotionnelle | Psychologue + Éducateur | Emploi du temps visuel, préparation verbale, technique de calme (respiration) | Intégré à chaque séance | 6 mois | Réduction de l'agitation à 70% des transitions ; augmentation de la coopération |
| Communication structurée | 2.2.3.1 Accompagnement dans la communication | Orthophoniste + Éducateur | Pictogrammes, gestes convenus, activités communicationnelles ludiques | 1-2 séances orthophonie/semaine + intégration éducative | 6-8 mois | Expression d'un besoin par 2+ pictogrammes ; diminution de l'écholalie ; augmentation de la parole fonctionnelle |
| Participation aux activités et interactions sociales | 2.3.2.1 + 2.3.3.1 Participation aux loisirs et soutien aux relations | Éducateur spécialisé | Activités loisir structurées (lego, animaux) en petit groupe ou duo ; facilitation des interactions | 1-2 activités/semaine | 8-12 mois | Participation autonome à 1 activité collective ; initiation de contact basique 1x/semaine |
| Soutien à la parentalité | 2.4.3.1 Soutien à la parentalité | Éducateur + Psychologue | Formations pratiques (démonstration, co-intervention), fiches consignes, débriefing régulier | 1 séance spécifique/mois + mensuel | 12 mois | Parents reproduisent les stratégies : diminution des tensions à domicile (50% des routines) ; augmentation du sentiment de compétence parental |

---

##### **9. Suivi et réévaluation**

**Critères d'évaluation**

L'évaluation du projet s'appuiera sur des critères concrets et observables : la fréquence et la qualité de l'utilisation des supports visuels, la diminution mesurable de l'agitation lors des transitions, le nombre et la pertinence des énoncés communicationnels (au-delà de l'écholalie), le nombre de participations à des activités, la qualité des interactions sociales (regard, approche, échange).

Les parents et l'équipe scolaire seront consultés régulièrement pour ajuster les observations et valider les progressions.

**Fréquence de réévaluation**

Une première évaluation intermédiaire sera réalisée après trois mois, permettant d'ajuster rapidement les stratégies si nécessaire. Une évaluation complète sera conduite tous les six mois, donnant lieu à une révision formelle du PPA. Annuellement, une rencontre multi-partenaires (parents, école, SESSAD) permettra de formaliser les évolutions et de (re)définir les priorités.

**Modalités de suivi**

Les éducateurs et la psychologue tiendront à jour un carnet de bord simple (notes courtes, grille de suivi) sur les progrès observés à chaque séance. Les parents seront invités à partager leurs observations entre les séances. L'école transmettra des rapports d'étape tous les deux mois.

---

##### **10. Conclusion**

Ce projet personnalisé d'accompagnement vise à soutenir la personne accompagnée dans son parcours de développement, en s'appuyant sur ses forces (capacité à s'engager avec les adultes, intérêts spécifiques) et en répondant à ses besoins clés (régulation émotionnelle, autonomie, communication, participation sociale).

L'implication conjointe du SESSAD, de l'école et de la famille constitue un levier majeur de progression. L'utilisation systématique de supports visuels et la cohérence des approches éducatives favoriseront une progression durable.

Le projet sera révisé dans six mois, avec une évaluation complète annuelle. Toute modification significative de la situation (nouveau diagnostic, changement scolaire, crise familiale) pourra justifier une révision anticipée du PPA.

---

**Document généré avec aide IA -- à valider par le professionnel avant toute diffusion au dossier d'accompagnement.**

---

---

## 💡 CONSEILS D'UTILISATION

### Quand utiliser ce prompt

✅ À la création du PPA ou lors d'une révision annuelle
✅ Pour structurer les observations et analyses des professionnels
✅ Pour assurer la conformité avec la nomenclature SERAFIN-PH
✅ Pour générer un document directement exploitable et conforme

### Quand relire et adapter

⚠️ **Validation professionnelle obligatoire** avant toute diffusion au dossier usager
⚠️ Vérifier l'anonymisation complète et l'absence d'identifiants
⚠️ Adapter les codes SERAFIN-PH selon la réalité de la situation (la nomenclature est riche et peut comporter plusieurs codes pertinents)
⚠️ Personnaliser les objectifs et les modalités selon le contexte d'intervention
⚠️ Assurer la cohérence entre les besoins identifiés, les prestations et les objectifs

### Points d'attention essentiels

**Anonymisation** : vérifier qu'aucun élément identifiant ne reste (nom, prénom, adresse, référence d'établissement précise)

**Utilisation SERAFIN-PH** : s'approprier les codes officiels et ne pas les inventer ; consulter la documentation si doute

**Spécificité** : adapter le PPA à la réalité unique de chaque personne ; éviter les formulations génériques

**Réalisme** : s'assurer que les objectifs et échéances sont réalistes et atteignables pour la personne

**Coordination** : assurer la cohérence avec les autres documents du dossier (rapports scolaires, suivis médicaux, etc.)

**Actualisation** : prévoir des dates de révision claires et respecter les délais légaux (révision annuelle minimum)

---

## 📚 RESSOURCES COMPLÉMENTAIRES

### Documentation SERAFIN-PH
- Nomenclatures détaillées (codes et intitulés complets)
- Fiches autonomie usager
- Supports pédagogiques et synthèses

### Cadre légal et recommandations
- Code de l'action sociale et des familles (CASF)
- Recommandations de bonnes pratiques professionnelles (HAS)
- Loi 2002-2 (droits des personnes accompagnées)

### Bonnes pratiques
- Approche centrée sur la personne et son autodétermination
- Participation active de la personne et de sa famille
- Collaboration multi-partenaires
- Traçabilité et continuité du suivi

---

**Document de référence -- À adapter selon les besoins spécifiques de chaque contexte.**

