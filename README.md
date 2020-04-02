# RoofControl
> **NOTE:** This script is intended to replace SimpleRoofControl. It will still accept the old !ShowHideRoof command with all of its parameters for roofs created with the old script, but you must use the new commands to create and use new roofs. When replacing SimpleRoofControl with this script, it will automatically migrate your configuration settings and all locked tokens. **Do not** use both scripts together.

This [Roll20](http://roll20.net/) script is a roof "lifting" system to show/hide rooms or entire houses. Buildings with multiple roof graphics, or the roofs of multiple buildings, can be controlled by a single anchor token. You have the option to turn Dynamic Lighting and/or Advanced Fog of War on or off so you can have those features enabled only inside the building(s).

You can also designate a graphic to be placed on the map layer to broaden the functionality of the script. For instance, you can now hide a pit trap that gets revealed (moved to the map layer) which allows the player tokens to remain visible. (By default, Roofs - tokens revealed on the token layer - are automatically sent to the top to hide all graphics below it.) You can optionally lock the position of the roof to prevent accidental moving or resizing.

## Commands
* **!roof link**
* **!roof flip** [<_dynamic_lighting_control_> <_advanced_fog_of_war_control_>] <_anchor_token_id_>
* **!roof config**
* **!roof help**

## Setup
To prepare a roof for use with the script follow the directions below:
1. Verify you're on the *Objects & Tokens Layer*.
2. Place all "Roof" graphics and size/position them to your needs. If you have [position locking](#configuration) on, you won't be able to adjust this later.
3. Enter **"Roof"** (capitalization counts!) into the first Bar 1 field of each "Roof" regardless of the layer you wish to show it on.
4. If the "Roof" graphic is to be revealed on the map layer, enter **"map"** into the second Bar 1 field.
5. Place a token somewhere near the roof/building. This can be a transparent graphic, a bush, whatever. Try to place it somewhere it will remain unobstructed by other tokens.
6. Enter **"RoofAnchor"** (yes the R and A need to be capitalized) into the first Bar 1 field.
7. With all tokens from above selected, type `!roof link` in chat to link the tokens. The RoofAnchor token will be given a GM-only aura to distinguish it as your roof anchor (see [Configuration](#configuration) below).

## How to Use
Once you have your Roof(s) setup, you select one or more RoofAnchor tokens and use the following command:

```
!roof flip
```

By default, this command will only toggle Roof token visibility. If you want to control Dynamic Lighting and/or Advanced Fog of War you can send additional parameters. There are three for each feature, all case insensitive, which are pretty self-explanatory. `dl-on` or `fow-on` turns on (or leaves on) Dynamic Lighting and Advanced Fog of War, respectively. Using `dl-off` or `fow-off` turns or leaves them off, and `dl-toggle` or `fow-toggle` flips them on if they're off and vice versa. You can use one or both parameters together in any order.

```
!roof flip dl-on
!roof flip dl-off fow-off
!roof flip fow-toggle
!roof flip fow-on dl-toggle
```

In some instances you may be using macros with multiple API script calls and one of them uses target tokens, causing your RoofAnchor token to be de-selected. Or the RoofAnchor tokens you want to use may be spread out. In these cases, you can send the ID of the RoofAnchor token as the **last** parameter to the command. To affect multiple anchors, send all RoofAnchor token IDs as a comma-delimited list.

```
!roof flip @{selected|token_id}
!roof flip dl-on @{target|RoofAnchor|token_id}
!roof flip -LVo7yDRijRbyShF5OeO
!roof flip dl-toggle fow-off -LuplpqmFMHrVmmxeEtF,-Lv3wJInyuS8zzr-0NCj
```

Note: Sending token IDs will cause any selected tokens to be ignored.

## Configuration
You can enter the Config Menu by sending `!roof config` in the chat. This dialog gives access to changing the following options:
* **Anchor Color** is the hexadecimal value of the aura applied to the RoofAnchor token. You may change this color to any valid hexadecimal color you wish using the button provided.
* **Aura** is the aura field to be used on the RoofAnchor token. If you are using your tokens' Aura 1 for a different purpose or another script is using them, you may change the Aura setting to use Aura 1 instead. To do this, just click the button provided.
* **Position Locking** allows you to lock the position, size and rotation of a Roof token whenever you link it with its RoofAnchor. This can be helpful on a crowded map or if there is a tendency to drag the wrong tokens. _This does not lock the RoofAnchor token._ Roofs linked with position locking turned on will remain locked after this feature is disabled, so if you wish to unlock a roof token, send `!roof unlock` with the RoofAnchor token selected. This unlocks **all** roof tokens associated with that anchor.
* **GM Only** allows you to give players access to the `!roof flip` command. This allows more flexibility and creativity with the script, like creating player macros to let them change their environment.

## In-Chat Help
You may have [Setup](#setup) instructions based on your configuration settings given to you at any time by sending `!roof help` in chat.
