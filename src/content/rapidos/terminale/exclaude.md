---
numero: "99"
niveau: "Terminale"
theme: "Entraînement"
periode: 3
semaine: 20
questions:
  - variantes:
      - texte: "Quel nombre représente le point A sur cet axe ?"
        gs: "GS 1.5"
        visual:
          type: "axe-gradue"
          position: "north"
          config:
            min: 0
            max: 10
            step: 1
            orientation: "horizontal"
            points:
              - label: "A"
                value: 5
                color: "#f59e0b"
          editable: true
      - texte: "Placez le nombre $7,5$ sur l'axe gradué."
        gs: "GS 1.5"
        visual:
          type: "axe-gradue"
          position: "north"
          config:
            min: 0
            max: 10
            step: 0.5
            showNumbers: true
  - variantes:
      - texte: "Trouvez l'inconnue."
        gs: "GS 5.2"
---