# VGauge

A vanilla javascript svg gauge 

_"has zero dependencies and since it presents itself to the browser as an svg it scales nicely on touch devices"_

demo here

### Cookbook

1. html

```html
<div id="gaugeContainer">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100"></svg>
</div>
```

2. script
```javascript

const settings = {
    name: 'Room 1',
    unit: '°C',
    min: -20,
    max: 50,
    startAngle: 90,
    sweepAngle: 260,
    useHelperGrid: true,
    useTargetValue: true,
    cluster: {
        innerRadius: 30,
        outerRadius: 40,
        useTickLabels: true,
        sectors: [
            { fill: bootStrapColorYellow, opacity: 0.1, sweepTo: -5 },
            { fill: bootStrapColorBlue, opacity: 0.1, sweepTo: 20 },
            { fill: bootStrapColorGreen, opacity: 0.1, sweepTo: 30 },
            { fill: bootStrapColorRed, opacity: 0.1, sweepTo: 50 }
        ]
    },
    indicator: {
        innerRadius: 32,
        outerRadius: 40
    },
    targetValue: {
        min: 15,
        max: 30,
        indicator: {
            radius: 35,
            path: '<path d="M 0,0 L -4,6 L 4,6 Z"></path>',
            fill: ''
        },
        label: {
            radius: 44.5,
            fontSize: '6px',
            fill: ''
        }
    },
    tweek: {
        fontFamily: '',
        backgroundColor: '',
        name: { x: 0, y: -10, fill: '', fontSize: '7px' },
        unit: { x: 2, y: 39, fill: '', fontSize: '11px' },
        value: { x: 40, y: 20, fill: '', fontSize: '1rem', decimals: 1 },
        ticks: { radius: 44, fontSize: '8px', fill: '#7f7f7f', opacity: 0.1 },
        icons: [{ id: 1, x: 34, y: -45, scale: 1, fill: '', opacity: 1.0, path: bootstrapFireIcon }]
    }
};

let gauge = new VGauge('gaugeContainer', settings);


```



<picture>
  <source media="(prefers-color-scheme: dark)" srcset="images/names_dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="images/gauge2_cc_black.svg">
  <img alt="Shows a gauge" height="600">  
</picture>


> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.


<details>

<summary>Tips for collapsed sections</summary>

### You can add a header

You can add text within a collapsed section. 

You can add an image or a code block, too.

```ruby
   puts "Hello World"
```

</details>

