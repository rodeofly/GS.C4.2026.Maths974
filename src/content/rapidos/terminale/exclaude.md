---
numero: "T1"
niveau: "Terminale"
theme: "Test Composant"
periode: 3
semaine: 21
questions:
  - variantes:
      - texte: "Quel nombre est représenté par le point A ?"
        gs: "GS 1.5"
        visual:
          type: "axe-gradue"
          position: "north"
          config:
            min: 42
            max: 52
            step: 1
            points: [{ label: "A", value: 47, color: "#0d9488" }]
      - texte: "Donnez la valeur du point B (précision au dixième)."
        gs: "GS 1.5"
        visual:
          type: "axe-gradue"
          position: "north"
          config:
            min: 5.4
            max: 6.4
            step: 0.1
            showNumbers: true
            points: [{ label: "B", value: 5.9, color: "#dc2626" }]
      - texte: "Identifiez le nombre C (précision au centième)."
        gs: "GS 1.5"
        visual:
          type: "axe-gradue"
          position: "north"
          config:
            min: 0.75
            max: 0.85
            step: 0.01
            points: [{ label: "C", value: 0.79, color: "#f59e0b" }]
      - texte: "Positionnez le point D sur cet axe vertical."
        gs: "GS 1.5"
        visual:
          type: "axe-gradue"
          position: "east"
          config:
            min: 100
            max: 110
            step: 2
            orientation: "vertical"
            points: [{ label: "D", value: 104, color: "#0f766e" }]
---