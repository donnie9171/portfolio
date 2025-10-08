## Types of blocks

### Title block
<img src="assets/UI design/editor screenshot 1.png" alt="Editor Screenshot 1" style="max-width:100%; border-radius:8px; box-shadow:0 2px 12px rgba(0,0,0,0.08); margin:1em 0;" />

```
{
    title: md string,
    subtitle: md string,
    overview: md string,
    people: md string,
    img1:{
        src: string,
        caption: md string
    },
    img2:{
        src: string,
        caption: md string
    },
    imgmobile:{
        src: string,
        caption: md string
    },
    card: [string array of card names] (optional)
}
```
### Text block
<img src="assets/UI design/editor screenshot 2.png" alt="Editor Screenshot 1" style="max-width:100%; border-radius:8px; box-shadow:0 2px 12px rgba(0,0,0,0.08); margin:1em 0;" />

```
{
    text: md string,
    card: [string array of card names] (optional)
}
```

### Image block
<img src="assets/UI design/editor screenshot 3.png" alt="Editor Screenshot 1" style="max-width:100%; border-radius:8px; box-shadow:0 2px 12px rgba(0,0,0,0.08); margin:1em 0;" />

```
{
    size: large | fit
    no-ratio: bool
    no-shadow: bool
    images: [
        img: {
            src: string,
            caption: md string
        }, ...
    ],
    card: [string array of card names] (optional)
}
```

### Quote block
<img src="assets/UI design/editor screenshot 4.png" alt="Editor Screenshot 1" style="max-width:100%; border-radius:8px; box-shadow:0 2px 12px rgba(0,0,0,0.08); margin:1em 0;" />

```
{
    quote: md string,
    card: [string array of card names] (optional)
}
```

### Cardbox block
<img src="assets/UI design/editor screenshot 5.png" alt="Editor Screenshot 1" style="max-width:100%; border-radius:8px; box-shadow:0 2px 12px rgba(0,0,0,0.08); margin:1em 0;" />

```
{
    card-shown: [ array of card names ] (only shown, not necessarily the ones given to the player), 
    card: [string array of card names] (optional)
}
```

### Separator block
```
{
    (no attributes it's just a separator line)
}
```