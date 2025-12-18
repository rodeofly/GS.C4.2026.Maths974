---
numero: "T1"
niveau: "Terminale"
theme: "Test Composant"
periode: 3
semaine: 21
questions:
  - variantes:
      - texte: "Niveau 1 (Unités) : Quelle est la valeur du point A ?"
        visual:
          type: "axe-gradue"
          config:
            min: 42
            max: 52
            step: 1
            points: [{ label: "A", value: 47 }]
      - texte: "Niveau 2 (Dixièmes) : Quelle est la valeur du point B ?"
        visual:
          type: "axe-gradue"
          config:
            min: 5.4
            max: 6.4
            step: 0.1
            points: [{ label: "B", value: 5.9, color: "#dc2626" }]
      - texte: "Niveau 3 (Centièmes) : Identifiez la position précise de C."
        visual:
          type: "axe-gradue"
          config:
            min: 0.75
            max: 0.85
            step: 0.01
            points: [{ label: "C", value: 0.79, color: "#f59e0b" }]
      - texte: "Niveau 4 (Vertical) : Quelle température indique ce thermomètre ?"
        visual:
          type: "axe-gradue"
          position : "east"
          config:
            min: 15
            max: 25
            step: 0.5
            orientation: "vertical"
            points: [{ label: "T°", value: 18.5 }]
---