type Meta = ReturnType<typeof parseImageUrl>;

export function replaceImagesRandom(imageCdns: string[], text: string) {
  // Find all images used on the page
  const regexp = new RegExp(
    `(${imageCdns.join("|")})/image/[^&]*?\\.(webp|jpg|png)`,
    "g"
  );

  const images = new Map<string, Meta>();
  const matches = Array.from(text.matchAll(regexp));

  for (const match of matches) {
    const image = match[0];
    const meta = parseImageUrl(image);
    images.set(meta.name, meta);
  }

  // Re-assign images randomly
  const shuffledKeys = images
    .keys()
    .toArray()
    .sort(() => (Math.random() > 0.5 ? 1 : -1));

  const imageData = images.values().toArray();
  const shuffledImages = new Map(
    shuffledKeys.map((key, i) => [key, imageData[i]])
  );

  // Add a disclaimer that this is in fact not the real page
  let output = `
    <style>
      .header__logo__wortmarke-ts { 
        position: relative; 
        min-width: 20rem;
      }
      
      .header__logo__wortmarke-ts::after { 
        content: "Kunstprojekt! NICHT tagesschau.de"; 
        position: absolute; 
        inset: 0; 
        color: white; 
        line-height: 1.4; 
        font-size: 1.25rem; 
        font-weight: bold; 
        letter-spacing: 0.5px; 
        background: #1b2841; 
      }
    </style>
  `;

  // Build the html with the new images
  let currentIdx = 0;

  for (const match of matches) {
    const image = match[0];

    const start = match.index;
    const end = start + image.length;

    output += text.slice(currentIdx, start);

    const originalImage = parseImageUrl(image);
    const newImage = shuffledImages.get(originalImage.name);

    let newImageUrl = image;
    if (newImage) {
      newImageUrl = `https://${originalImage.domain}/${newImage.id}/${originalImage.aspectRatio}/${newImage.name}.${originalImage.extension}`;
    }

    output += newImageUrl;

    // Skip to the index in the original html after the current match
    currentIdx = end;
  }

  return output;
}

function parseImageUrl(imageUrl: string) {
  const url = new URL(imageUrl);
  const parts = url.pathname.split(/[/.]/);

  return {
    domain: url.hostname,
    id: parts.slice(1, 5).join("/"),
    aspectRatio: parts[5],
    name: parts[6],
    extension: parts[7],
  };
}
