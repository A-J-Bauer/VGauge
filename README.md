# <a id="top"></a>
# VGauge

 javascript svg circular gauge widget

_"zero dependencies and scales nicely on touch devices"_


[demo here](https://a-j-bauer.github.io/VGauge/)

&nbsp;


| Examples | Description
| ----------- | ----------- |
| [<picture><source media="(prefers-color-scheme: dark)" srcset="images/basic_dark.svg"><source media="(prefers-color-scheme: light)" srcset="images/basic_light.svg"><img alt="gauge with basic settings" height="120"></picture>](#basic) | Simple gauge with a value indicator, a name, a unit and a value label. |
| [<picture><source media="(prefers-color-scheme: dark)" srcset="images/custom_indicator_color_dark.svg"><source media="(prefers-color-scheme: light)" srcset="images/custom_indicator_color_light.svg"><img alt="gauge with custom indicator color" height="120"></picture>](#custom-indicator-color) | Gauge with a custom color value indicator, a name, a unit and a value label. |
| [<picture><source media="(prefers-color-scheme: dark)" srcset="images/multi_dark.svg"><source media="(prefers-color-scheme: light)" srcset="images/multi_light.svg"><img alt="gauge with custom indicator color" height="120"></picture>](#multi-color) | This gauge gives the user visual feedback (at a glance) of the current state by using defined colors like: blue for 'too cold', green for 'all good', red for 'too hot'. |

<a id="basic"></a> [Back to top](#top)

&nbsp;

## usage

```
<div>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100">
        <g id="groupId"></g>
    </svg>
</div>
```

```javascript
<script src="pathTo/vgauge.js"></script>
```

```javascript
const gauge = new VGauge('groupId', settings);

gauge.value = 34.6;
```

## examples

Simple gauge with a value indicator, a name, a unit and a value label.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="images/basic_dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="images/basic_light.svg">
  <img alt="gauge with basic settings" height="200">  
</picture>

<details>
<summary>settings JSON</summary>

```javascript
   {
    "min": -20,
    "max": 50,
    "startAngle": 90,
    "sweepAngle": 260,
    "fontFamily": "",
    "backgroundColor": "",
    "indicator": {
        "innerRadius": 32,
        "outerRadius": 40
    },
    "name": {
        "text": "Room 1",
        "x": 0,
        "y": -10,
        "fill": "",
        "fontSize": "7px"
    },
    "unit": {
        "text": "°C",
        "x": 2,
        "y": 39,
        "fill": "",
        "fontSize": "11px"
    },
    "value": {
        "x": 40,
        "y": 20,
        "fill": "",
        "fontSize": "1rem",
        "decimals": 1
    }
}
```
</details>




> [!NOTE]
> The fill color used for all elements of the gauge is the color style of the container (currentColor).

<!-- ####################################################################################################################### -->

<a id="custom-indicator-color"></a> [Back to top](#top)

&nbsp;

Gauge with a custom color value indicator, a name, a unit and a value label.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="images/custom_indicator_color_dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="images/custom_indicator_color_light.svg">
  <img alt="gauge with custom indicator color" height="200">  
</picture>

<details>
<summary>settings JSON</summary>

```javascript
{
    "min": -20,
    "max": 50,
    "startAngle": 90,
    "sweepAngle": 260,
    "useHelperGrid": true,
    "fontFamily": "",
    "backgroundColor": "",
    "cluster": {
        "innerRadius": 30,
        "outerRadius": 40,
        "useTickLabels": false,
        "sectors": [
            {
                "fill": "#ffc107",
                "opacity": 0.02,
                "sweepTo": 50,
                "useAsValueColor": false,
                "useAsIndicatorColor": true
            }
        ]
    },
    "value": {
        "x": 40,
        "y": 20,
        "fill": "",
        "fontSize": "1rem",
        "decimals": 1
    },
    "indicator": {
        "fill": "",
        "innerRadius": 32,
        "outerRadius": 40
    },
    "name": {
        "text": "Room 1",
        "x": 0,
        "y": -10,
        "fill": "",
        "fontSize": "7px"
    },
    "unit": {
        "text": "°C",
        "x": 2,
        "y": 39,
        "fill": "",
        "fontSize": "11px"
    }
}
```
</details>



> [!NOTE]
> The fill color used for labels is the color style of the container (currentColor) and the fill color used for the indicator is the color set for the underlying sector.
> The underlying sector's opacity can be adjusted to give the user a visual hint of the max range. Set the opacity to 0 if you want to hide the underlying sector completely.

<!-- ####################################################################################################################### -->

<a id="multi-color"></a> [Back to top](#top)

&nbsp;

This gauge gives the user quick visual feedback by using colors like: blue for 'too cold', green for 'all good', red for 'too hot'.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="images/multi_dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="images/multi_light.svg">
  <img alt="gauge with custom indicator color" height="200">  
</picture>



<details>

<summary>settings JSON</summary>

```javascript
{
    "min": -20,
    "max": 50,
    "startAngle": 90,
    "sweepAngle": 260,    
    "fontFamily": "",
    "backgroundColor": "",
    "cluster": {
        "innerRadius": 30,
        "outerRadius": 40,
        "useTickLabels": true,
        "sectors": [
            {
                "fill": "#ffc107",
                "opacity": 0.1,
                "sweepTo": -5,
                "useAsValueColor": false,
                "useAsIndicatorColor": true
            },
            {
                "fill": "#0d6efd",
                "opacity": 0.1,
                "sweepTo": 15,
                "useAsValueColor": false,
                "useAsIndicatorColor": true
            },
            {
                "fill": "#198754",
                "opacity": 0.1,
                "sweepTo": 30,
                "useAsValueColor": false,
                "useAsIndicatorColor": true
            },
            {
                "fill": "#dc3545",
                "opacity": 0.1,
                "sweepTo": 50,
                "useAsValueColor": true,
                "useAsIndicatorColor": true
            }
        ]
    },
    "value": {
        "x": 40,
        "y": 20,
        "fill": "",
        "fontSize": "1rem",
        "decimals": 1
    },
    "indicator": {
        "fill": "",
        "innerRadius": 32,
        "outerRadius": 40
    },    
    "name": {
        "text": "Room 1",
        "x": 0,
        "y": -10,
        "fill": "",
        "fontSize": "7px"
    },
    "unit": {
        "text": "°C",
        "x": 2,
        "y": 39,
        "fill": "",
        "fontSize": "11px"
    },
    "ticks": {
        "radius": 44,
        "fontSize": "8px",
        "fill": "#7f7f7f",
        "opacity": 0.1
    }
}
```

</details>

> [!NOTE]
> The fill color used for labels is the color style of the container (currentColor) and the fill color used for the indicator is the color of the underlying sector that the current value corresponds to.
> The underlying sectors opacity can each be adjusted to give the user a visual hint of the max range. Set the opacity to 0 if you want to hide the underlying sector completely.

&nbsp;


## miscellaneous

### cdn

you can find minified files and integrity values in the dist folder

### add event handlers

to make the gauge container focusable/selectable add tabindex="0" to the container div
for bootstrap add form-control, mb-2 and mt-2 to class attribute.


***

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="images/names1_dark.svg">
  <source media="(prefers-color-scheme: dark)" srcset="images/name_defs_light.svg">
  <img alt="Shows a gauge" width="500">  
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="images/names2_dark.svg">
  <source media="(prefers-color-scheme: dark)" srcset="images/names2_light.svg">
  <img alt="Shows a gauge" width="500">  
</picture>

***

> [!TIP]
> when using the demo, you can use ctrl-s inside the JSON editor to recreate.
   
