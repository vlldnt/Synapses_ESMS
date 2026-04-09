# Contexte et Prompt pour Génération de CR d'Intervention - ESMS

---

## 📋 RÉSUMÉ DU CONTEXTE PROJET

Ce projet concerne la **création automatisée de Comptes Rendus (CR) d'intervention** pour des structures du secteur **social et médico-social (ESMS)**, notamment :

- **SESSAD** (Services d'Éducation Spécialisée et de Soins À Domicile)
- Structures d'accompagnement éducatif
- Services d'aide à domicile
- Structures de protection de l'enfance
- Services de suivi et d'insertion

### Objectifs

✅ **Automatiser la rédaction** de comptes rendus professionnels et structurés
✅ **Garantir la conformité** RGPD et la confidentialité totale
✅ **Faciliter le suivi** avec des objectifs opérationnels clairs et évaluables
✅ **Sécuriser la traçabilité** des interventions et de l'accompagnement
✅ **Libérer du temps** aux professionnels pour l'accompagnement direct

### Contexte d'utilisation

Les professionnels (éducateurs, psychologues, travailleurs sociaux) disposent de notes de terrain brutes ou anonymisées suite à une intervention. Ils fournissent ces informations à l'IA qui générera un CR complet, structuré et directement exploitable dans le dossier usager.

---

## 🎯 PROMPT À ENVOYER À L'IA

### VERSION STRUCTURÉE ET OPTIMISÉE

```
Tu es un expert en rédaction de comptes rendus d'intervention pour le secteur
social et médico-social (ESMS). Ton rôle est de transformer des notes de terrain
anonymisées en compte rendu professionnel, structuré et directement intégrable
dans le dossier d'accompagnement.

════════════════════════════════════════════════════════════════════════════════

📋 RÈGLES OBLIGATOIRES

CONFIDENTIALITÉ & RGPD
• Aucun nom, prénom, adresse, date de naissance ou localisation précise
• Anonymisation totale et explicite
• Mention obligatoire : « ⚠️ Aide IA -- Validation humaine obligatoire avant diffusion »
• Aucune donnée identifiable ne doit apparaître

QUALITÉ RÉDACTIONNELLE
• Style professionnel, neutre et factuel
• Phrases complètes, pas de listes à puces (sauf titres et tableau final)
• Langage clair, vocabulaire accessible, pas de jargon inutile
• Désigner la personne par : « la personne accompagnée », « l'usager », « l'accompagné(e) »

GESTION DES ACRONYMES
• Développer la première occurrence (ex: SESSAD = Services d'Éducation Spécialisée...)
• Utiliser l'acronyme seul par la suite

OBJECTIFS OPÉRATIONNELS
• Formuler des objectifs observables, réalistes et évaluables
• Respect strict des critères (sans nommer "SMART")
• Durée maximale : 3 mois par objectif
• Privilégier des paliers progressifs et des réussites visibles
• Chaque action clairement attribuée avec responsable et échéance

════════════════════════════════════════════════════════════════════════════════

🏗️ STRUCTURE OBLIGATOIRE DU CR

1️⃣ IDENTIFICATION DE L'INTERVENTION
   → Type, lieu, date, durée, trajet, professionnels impliqués (par fonction)

2️⃣ CONTEXTE ET OBJECTIF
   → Cadre du projet personnalisé d'accompagnement (PPA)
   → Objectif spécifique de l'intervention du jour

3️⃣ DÉROULEMENT DE L'INTERVENTION
   → Description factuelle et chronologique
   → Observations comportementales, réactions observées
   → Difficultés rencontrées et ressources mobilisées

4️⃣ ANALYSE PROFESSIONNELLE
   → Points d'appui identifiés
   → Freins et leviers d'évolution
   → Posture neutre et rigoureuse

5️⃣ PLAN D'ACTIONS OPÉRATIONNEL À COURT TERME
   → Objectifs accessibles et progressifs
   → Attribution claire à un responsable
   → Échéances précises (≤ 3 mois)

📊 TABLEAU RÉCAPITULATIF DES OBJECTIFS
   Colonnes : Objectif opérationnel | Action prévue | Responsable | Modalités |
             Fréquence | Échéance (≤ 3 mois) | Indicateur d'évaluation

6️⃣ SUIVI ET INDICATEURS
   → Critères d'évaluation rédigés
   → Réévaluation prévue dans 3 mois max.

7️⃣ CONCLUSION
   → Synthèse de l'intervention
   → Perspectives à court terme
   → Prochain point de suivi

════════════════════════════════════════════════════════════════════════════════

📌 CONSIGNES DE RÉDACTION

✓ Phrases courtes et complètes
✓ Formulations factuelles : « il a été observé que »
✓ Attribution explicite des actions (fonction du professionnel)
✓ Neutralité absolue, sans jugement ni stigmatisation
✓ En dehors des titres : aucune puce, tiret, numérotation
✓ Seule exception : le tableau des objectifs peut être structuré

════════════════════════════════════════════════════════════════════════════════

Voici maintenant les notes de terrain anonymisées :

[À INSÉRER : notes de terrain brutes ou observations]

Rédige le compte rendu complet en suivant strictement la trame décrite ci-dessus.
```

════════════════════════════════════════════════════════════════════════════════

---

## 📖 EXEMPLE CONCRET - AVANT / APRÈS

### ➡️ NOTES DE TERRAIN (ENTRÉE)

```
VAD effectuée par l'éducateur et la psychologue du SESSAD chez les parents.

Objectif : faire le point sur la situation à domicile.

Résultats du bilan psychométrique : légère déficience intellectuelle, compétences
présentes mais mobilisation difficile. Retard dans les apprentissages scolaires.

Dynamique familiale problématique : l'enfant est en conflit constant avec ses parents,
opposition sur les gestes d'hygiène, l'heure du coucher, etc. Les parents se sentent
démunis et culpabilisent. Le père est actuellement en arrêt maladie.

Hypothèse : les difficultés viennent de l'environnement familial et du fonctionnement
familial, non d'une opposition généralisée (l'enfant écoute les professionnels).

Recommandation : aide éducative via les services sociaux pour modifier la dynamique
familiale et soutenir les parents. Les parents acceptent de faire les démarches.

Prochain rdv : l'éducateur accompagnera les parents pour contacter les services sociaux.
```

### ⬅️ COMPTE RENDU GÉNÉRÉ (SORTIE)

---

#### **COMPTE RENDU DE VISITE À DOMICILE**

⚠️ Aide IA -- Validation humaine obligatoire avant diffusion.

**Aucune donnée personnelle identifiable ne doit être utilisée.**

---

##### **1. Identification de l'intervention**

Une visite à domicile (VAD) a été effectuée par l'éducateur spécialisé et la psychologue du SESSAD (Services d'Éducation Spécialisée et de Soins À Domicile) auprès de la famille. Cette intervention s'est déroulée le [JJ/MM/AAAA] et a permis une rencontre de suivi avec les parents. L'objectif était de faire le point sur la situation de la personne accompagnée à domicile et d'évaluer les besoins de la famille en termes d'accompagnement.

##### **2. Contexte et objectif de l'intervention**

La personne accompagnée fait l'objet d'un suivi au SESSAD depuis plusieurs mois. Un bilan psychométrique réalisé antérieurement a mis en évidence une légère déficience intellectuelle ainsi que des compétences présentes. Il a été observé que la personne accompagnée bénéficie d'une relation positive avec les professionnels du SESSAD et de l'école, démontrant une capacité à écouter et à collaborer dans ces contextes. Cependant, des difficultés significatives dans les apprentissages scolaires ont été repérées, et des tensions relationnelles avec les parents structurent le quotidien à domicile.

L'objectif de cette visite était de discuter avec les parents de la situation familiale, de clarifier les hypothèses de l'équipe SESSAD et d'explorer des pistes d'accompagnement adapté.

##### **3. Déroulement de l'intervention**

Les deux professionnels ont rencontré les parents dans le cadre d'un échange structuré. La psychologue a présenté les conclusions du bilan psychométrique en soulignant les compétences de la personne accompagnée, tout en reconnaissant le retard observé dans les apprentissages scolaires. La mère a exprimé son expérience des difficultés quotidiennes : des conflits récurrents, notamment autour des gestes d'hygiène (se brosser les dents) et des horaires de sommeil.

L'éducateur et la psychologue ont exposé l'hypothèse selon laquelle les difficultés rencontrées ne résultent pas d'une opposition généralisée, mais plutôt de la dynamique familiale et de l'environnement à domicile. Cette hypothèse s'appuie sur le fait que la personne accompagnée manifeste une meilleure collaboration avec les professionnels extérieurs.

Le père a partagé que sa situation professionnelle a changé récemment (arrêt maladie imminent). Les parents ont exprimé un sentiment de culpabilité, questionnant leurs propres pratiques éducatives.

L'équipe SESSAD a proposé une aide éducative, expliquant en détail son fonctionnement, sa durée prévisionnelle (environ six mois dans un premier temps) et son objectif de modifier progressivement la dynamique familiale. Les parents ont accepté cette proposition et ont consenti à engager les démarches auprès des services sociaux. L'équipe a proposé d'accompagner les parents dans ces démarches.

##### **4. Analyse professionnelle**

Cette intervention met en lumière plusieurs éléments significatifs : d'une part, la capacité de la personne accompagnée à collaborer avec les figures d'autorité externes constitue un point d'appui majeur pour l'accompagnement futur. D'autre part, la conscience des parents face aux difficultés et leur ouverture à recevoir une aide éducative représentent des leviers importants pour la mise en place d'une intervention.

Les freins identifiés résident dans la structure des interactions familiales, installée dans le temps, et dans les difficultés relationnelles qui en découlent. Le changement de situation professionnelle du père, tout en pouvant créer une fragilité supplémentaire, crée également une opportunité de mobilisation des ressources familiales.

Il a été convenu que l'aide éducative serait transitoire et aurait pour objectif d'apaiser le fonctionnement familial en renforçant les repères parentaux et en soutenant les parents dans leur autorité.

##### **5. Plan d'actions opérationnel à court terme**

| Objectif opérationnel | Action prévue | Responsable | Modalités | Fréquence | Échéance (≤ 3 mois) | Indicateur d'évaluation |
|---|---|---|---|---|---|---|
| Initier une démarche d'aide éducative auprès des services sociaux | Accompagner les parents dans la prise de contact avec les services sociaux, constituer le dossier de demande | Éducateur spécialisé | Accompagnement individuel / entretien téléphonique ou en présentiel selon les besoins | Selon les délais des services sociaux | 6 semaines | Dossier de demande transmis aux services sociaux et accepté pour traitement |
| Clarifier les objectifs d'accompagnement et les attentes mutuelles | Rencontre de formalisation entre l'équipe SESSAD, la famille et les services sociaux (si accord de la famille) | Psychologue + Éducateur | Réunion collective ou échanges structurés | Une réunion | 4 semaines | Accord écrit ou mémorandum établi avec l'ensemble des partenaires |

##### **6. Suivi et indicateurs**

L'évaluation de cette intervention reposera sur plusieurs critères. D'abord, la transmission effective du dossier aux services sociaux dans les délais prévus et son acceptation pour traitement. Ensuite, la clarification des objectifs partagés entre tous les professionnels impliqués. Enfin, la mobilisation continue des parents autour du projet, observable par leur implication dans les démarches initiées.

Une réévaluation de la situation sera effectuée trois mois après le démarrage de l'aide éducative, permettant de vérifier la continuité de l'engagement de la famille et l'impact des premières interventions éducatives.

##### **7. Conclusion**

Cette visite à domicile a permis d'établir un diagnostic partagé avec la famille et de mettre en place un plan d'action cohérent. Le système d'accompagnement mobilisé (SESSAD + services sociaux) offre une réponse adaptée à la situation, en s'appuyant sur les ressources identifiées (collaboration de la personne accompagnée avec les tiers, ouverture des parents). Le prochain étape consiste à formaliser la mise en place de l'aide éducative et à assurer la coordination entre les différents partenaires. Une rencontre de suivi est prévue à domicile avec l'éducateur pour accompagner les parents dans les démarches administratives.

---

**Rédigé avec l'aide de l'IA -- à relire et valider par un·e professionnel·le.**

---

---

## 💡 CONSEILS D'UTILISATION

### Quand utiliser ce prompt

✅ Après chaque intervention professionnelle
✅ Pour structurer des notes de terrain brutes
✅ Pour générer des CR immédiatement exploitables
✅ Pour assurer la conformité RGPD et éthique

### Quand relire et adapter

⚠️ **Validation humaine obligatoire** avant toute diffusion au dossier usager
⚠️ Vérifier l'anonymisation complète
⚠️ Ajuster les objectifs selon les particularités locales
⚠️ Personnaliser les indicateurs selon le contexte d'intervention

### Points d'attention

- **Anonymisation** : vérifier qu'aucun élément identifiant ne reste
- **Spécificité** : adapter les objectifs à la réalité de chaque usager
- **Réalisme** : s'assurer que les échéances (3 mois max) sont réalistes
- **Coordination** : vérifier la cohérence avec le PPA (Projet Personnalisé d'Accompagnement)
