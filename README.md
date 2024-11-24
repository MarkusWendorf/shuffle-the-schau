# Shuffle the Schau

Spielt die `tagesschau.de` Seite aus, würfelt dabei aber alle Bilder der Seite durcheinander. Marc Uwe Kling dem sein Känguru hatte die Idee: https://www.youtube.com/shorts/E25LpEzeI-8

Zu finden unter: [kunstprojekt.irrlicht.dev](https://kunstprojekt.irrlicht.dev)

Aktualisiert sich alle 10 Sekunden.

Technisch:
- Proxy der alle Bilder einer Seite im HTML findet (Domains: `images.tagesschau.de` und `images.sportschau.de`)
- diese dann durcheinander würfelt
- und das modifizierte HTML dann ausspielt
