---
numero: "99"
niveau: "cm2"
periode: 3
semaine: 20
questions:
  # Question 1 : Axe gradué avec variantes progressives
  - variantes:
      - texte: "Quel nombre représente le point A ?"
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
          
      - texte: "Sur l'axe gradué, où se situe le nombre 73 ?"
        gs: "GS 1.5"
        visual:
          type: "axe-gradue"
          position: "north"
          config:
            min: 0
            max: 100
            step: 10
            orientation: "horizontal"
            points:
              - label: "?"
                value: 73
                color: "#dc2626"
                
      - texte: "Encadre le point B à l'unité près : $\dots < B < \dots$"
        gs: "GS 1.5"
        visual:
          type: "axe-gradue"
          position: "north"
          config:
            min: 0
            max: 10
            step: 0.5
            orientation: "horizontal"
            showNumbers: true
            points:
              - label: "B"
                value: 7.3
                color: "#0f766e"

  # Question 2 : Repère cartésien (exemple théorique)
  - variantes:
      - texte: "Quelles sont les coordonnées du point M ?"
        gs: "GS 5.2"
        visual:
          type: "repere-cartesien"
          position: "east"
          config:
            xmin: -5
            xmax: 5
            ymin: -5
            ymax: 5
            xstep: 1
            ystep: 1
            showGrid: true
            points:
              - label: "M"
                x: 3
                y: 2
                color: "#f59e0b"
                
      - texte: "Place le point N(4, -3) sur le repère"
        gs: "GS 5.2"
        visual:
          type: "repere-cartesien"
          position: "east"
          config:
            xmin: -6
            xmax: 6
            ymin: -6
            ymax: 6
            xstep: 1
            ystep: 1
            showGrid: true

  # Question 3 : Fraction cercle
  - variantes:
      - texte: "Quelle fraction du cercle est coloriée ?"
        gs: "GS 8.1"
        visual:
          type: "fraction-cercle"
          position: "west"
          config:
            numerator: 3
            denominator: 4
            radius: 60
            fillColor: "#f59e0b"
            showLabel: false
            
      - texte: "Représente $\frac{2}{5}$ sur un cercle"
        gs: "GS 8.1"
        visual:
          type: "fraction-cercle"
          position: "west"
          config:
            numerator: 2
            denominator: 5
            radius: 60
            fillColor: "#0f766e"
            showLabel: true

  # Question 4 : Triangle avec mesures
  - variantes:
      - texte: "Quel est le périmètre de ce triangle ?"
        gs: "GS 10.2"
        visual:
          type: "triangle"
          position: "back"
          config:
            A: {x: 100, y: 200}
            B: {x: 300, y: 200}
            C: {x: 200, y: 50}
            showLengths: true
            showAngles: false
            fillColor: "#ccfbf1"
            strokeColor: "#0d9488"
          opacity: 0.2
          
      - texte: "Mesure l'angle $\widehat{ABC}$"
        gs: "GS 10.2"
        visual:
          type: "triangle"
          position: "front"
          config:
            A: {x: 100, y: 200}
            B: {x: 300, y: 200}
            C: {x: 200, y: 50}
            showLengths: false
            showAngles: true
            strokeColor: "#dc2626"

  # Question 5 : Cubes numération
  - variantes:
      - texte: "Quel nombre représentent ces cubes ?"
        gs: "GS 1.2"
        visual:
          type: "cubes-numeration"
          position: "south"
          config:
            milliers: 2
            centaines: 3
            dizaines: 4
            unites: 5
            cubeSize: 15
            spacing: 3
            showLabels: true
            
      - texte: "Représente le nombre 1 428 avec des cubes"
        gs: "GS 1.2"
        visual:
          type: "cubes-numeration"
          position: "south"
          config:
            milliers: 1
            centaines: 4
            dizaines: 2
            unites: 8
            cubeSize: 15
            spacing: 3
            showLabels: true
---
