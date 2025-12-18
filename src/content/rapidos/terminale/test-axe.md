---
numero: "T1"
niveau: "Terminale"
periode: 3
semaine: 21
questions:
  - variantes:
      - texte: "Niveau 1 (Unités) : Quelle est la valeur du point A ?"
        visual:
          type: "axe-gradue"
          position: "north"
          config: { min: 42, max: 52, step: 1, points: [{label: "A", value: 47}] }
      - texte: "Niveau 2 (Dixièmes) : Quelle est la valeur du point B ?"
        visual:
          type: "axe-gradue"
          position: "south" # TEST POSITION DROITE
          config: { min: 5.4, max: 6.4, step: 0.1, points: [{label: "B", value: 5.9}] }
      - texte: "Niveau 3 (Centièmes) : Identifiez la position de C."
        visual:
          type: "axe-gradue"
          position: "west" # TEST POSITION GAUCHE
          config: { min: 0.75, max: 0.85, step: 0.01, points: [{label: "C", value: 0.79}] }
      - texte: "Niveau 4 (Vertical) : Quelle température indique cet axe ?"
        visual:
          type: "axe-gradue"
          position: "east"
          config: { min: 10, max: 20, step: 1, orientation: "vertical", points: [{label: "T", value: 16}] }
---