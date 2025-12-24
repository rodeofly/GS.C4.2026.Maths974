---
numero: "T1"
niveau: "Terminale"
periode: 3
semaine: 21
questions:
  - variantes:
      - texte: "Niveau 1 (Unités) : Quelle est la valeur du point A ?"
        gs: "6N1-3.14"
        visual:
          type: "axe-gradue"
          position: "north"
          config: { min: 42, max: 52, step: 1, points: [{label: "A", value: 47}] }
      - texte: "Niveau 2 (Dixièmes) : Quelle est la valeur du point B ?"
        visual:
          type: "axe-gradue"
          position: "south"
          config: { min: 5.4, max: 6.4, step: 0.1, points: [{label: "B", value: 5.9}] }
      - texte: "Niveau 3 (Centièmes) : Identifiez la position de C."
        visual:
          type: "axe-gradue"
          position: "west"
          config: { min: 0.75, max: 0.85, step: 0.01, orientation: "vertical", points: [{label: "C", value: 0.79}] }
      - texte: "Niveau 4 (Vertical) : Quelle température indique cet axe ?"
        visual:
          type: "axe-gradue"
          position: "east"
          config: { min: 10, max: 20, step: 1, orientation: "vertical", points: [{label: "T", value: 16}] }

  - variantes:
      - texte: "Sur cet axe, quelle est la valeur du point M ?"
        gs: "6N1-5"
        visual:
          type: "axe-gradue"
          position: "north"
          config: { min: -5, max: 5, step: 1, points: [{label: "M", value: -2}] }
      - texte: "Quelle est l'abscisse du point N sur cet axe ?"
        gs: "6N1-5"
        visual:
          type: "axe-gradue"
          position: "north"
          config: { min: -3, max: 7, step: 1, points: [{label: "N", value: 3}] }
      - texte: "Déterminez la position du point P."
        gs: "6N1-5"
        visual:
          type: "axe-gradue"
          position: "north"
          config: { min: -10, max: 0, step: 1, points: [{label: "P", value: -7}] }

  - variantes:
      - texte: "Quelle est la valeur exacte du point D sur cet axe gradué ?"
        gs: "5N2-3"
        visual:
          type: "axe-gradue"
          position: "south"
          config: { min: 2.5, max: 3.5, step: 0.1, points: [{label: "D", value: 2.8}] }
      - texte: "Identifiez l'abscisse du point E."
        gs: "5N2-3"
        visual:
          type: "axe-gradue"
          position: "south"
          config: { min: 7.2, max: 8.2, step: 0.1, points: [{label: "E", value: 7.7}] }
      - texte: "Quelle est la position du point F ?"
        gs: "5N2-3"
        visual:
          type: "axe-gradue"
          position: "south"
          config: { min: -1.5, max: -0.5, step: 0.1, points: [{label: "F", value: -0.9}] }

  - variantes:
      - texte: "Sur cet axe vertical, à quelle hauteur se trouve le point H ?"
        gs: "4N1-2"
        visual:
          type: "axe-gradue"
          position: "north"
          config: { min: 0, max: 100, step: 10, orientation: "horizontal", points: [{label: "H", value: 60}] }
      - texte: "Quelle altitude indique le point K sur cet axe ?"
        gs: "4N1-2"
        visual:
          type: "axe-gradue"
          position: "east"
          config: { min: 50, max: 150, step: 10, orientation: "vertical", points: [{label: "K", value: 110}] }
      - texte: "Déterminez la température indiquée par le point R."
        gs: "4N1-2"
        visual:
          type: "axe-gradue"
          position: "east"
          config: { min: -20, max: 30, step: 5, orientation: "vertical", points: [{label: "R", value: 15}] }

  - variantes:
      - texte: "Sur cet axe précis, quelle est la valeur du point S ?"
        gs: "4N2-1"
        visual:
          type: "axe-gradue"
          position: "north"
          config: { min: 1.2, max: 1.3, step: 0.01, orientation: "horizontal", points: [{label: "S", value: 1.25}] }
      - texte: "Identifiez la mesure exacte du point V."
        gs: "4N2-1"
        visual:
          type: "axe-gradue"
          position: "west"
          config: { min: 0.4, max: 0.5, step: 0.01, orientation: "vertical", points: [{label: "V", value: 0.47}] }
      - texte: "Quelle est la valeur du point W sur cet axe millimétrique ?"
        gs: "4N2-1"
        visual:
          type: "axe-gradue"
          position: "west"
          config: { min: 2.35, max: 2.45, step: 0.01, orientation: "vertical", points: [{label: "W", value: 2.41}] }
---
