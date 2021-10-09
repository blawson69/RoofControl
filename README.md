# RoofControl

> **Notice:** This version _only_ supports Updated Dynamic Lighting. If your campaign is still using the legacy version, you must continue using the previous version.

This [Roll20](http://roll20.net/) script is a roof "lifting" system to show/hide rooms or entire houses. Buildings with multiple roof graphics, or the roofs of multiple buildings, can be controlled by a single anchor token. You have the option to turn (Updated) Dynamic Lighting and/or Explorer Mode on or off so you can have those features enabled only inside the building(s). You can optionally lock the position of the roof to prevent accidental moving or resizing.

You can also use RoofControl to manually trigger traps. For instance, you can hide a pit trap that gets revealed on the map layer (allowing the character tokens to remain visible) and display the trap's effect in chat for players. This effect can be either a roll template or regular text, and will only be displayed when showing the Roof token(s).

## Commands
* **!roof link**
* **!roof flip** [<_dynamic_lighting_control_> <_explorer_mode_control_>] <_anchor_token_id_>
* **!roof config**
* **!roof help**

## Setup
To prepare a roof for use with the script follow the directions below:
1. Verify you're on the *Objects & Tokens Layer*.
2. Place all "Roof" graphics and size/position them to your needs. If you have [position locking](#configuration) on, you won't be able to adjust this later.
    1. Enter **"Roof"** (capitalization counts!) into the first Bar 1 field of each "Roof" regardless of the layer you wish to show it on.
    2. If the "Roof" graphic is to be revealed on the map layer (beneath character tokens), enter **"map"** into the second Bar 1 field.
3. Place a token somewhere near the "Roof" token(s). This can be a transparent graphic, a bush, whatever. Try to place it somewhere it will remain unobstructed by other tokens. This is your Anchor Token that will need to be selected when sending `!roof` commands.
    1. Enter **"RoofAnchor"** (yes the R and A need to be capitalized) into the first Bar 1 field.
    2. If creating a trap and wish to provide an effect in chat, enter either a [roll template](https://roll20.zendesk.com/hc/en-us/articles/360037257334-How-to-Make-Roll-Templates) or regular text in the token's GM Notes field.
    3. If you are creating a trap effect (above) with regular text, you can give your effect a title in the second Bar 1 field. This title will be ignored when using a roll template.
4. With all tokens from above selected, type `!roof link` in chat to link the tokens. The RoofAnchor token will be given a GM-only aura to distinguish it as your roof anchor (see [Configuration](#configuration) below).
5. _Do not change the Bar 1 field values!_ These are used to identify the tokens.

## How to Use
Once you have your Roof(s) setup, you select one or more RoofAnchor tokens and use the following command:

```
!roof flip
```

By default, this command will only toggle Roof token visibility. If you want to control Dynamic Lighting and/or Explorer Mode you can send additional parameters. There are three for each feature, all case insensitive, which are pretty self-explanatory. `dl-on` or `fow-on` turns on (or leaves on) Dynamic Lighting and Explorer Mode, respectively. Using `dl-off` or `fow-off` turns or leaves them off, and `dl-toggle` or `fow-toggle` flips them on if they're off and vice versa. You can use one or both parameters together in any order.

```
!roof flip dl-on
!roof flip dl-off fow-off
!roof flip fow-toggle
!roof flip fow-on dl-toggle
```

In some instances you may be using macros with multiple API script calls and one of them uses target tokens, causing your RoofAnchor token to be de-selected. Or the RoofAnchor tokens you want to use may be spread out. In these cases, you can send the ID of the RoofAnchor token as the **last** parameter to the command. To affect multiple anchors, send all RoofAnchor token IDs as a comma-delimited list. Note: Sending token IDs will cause any selected tokens to be ignored.

```
!roof flip @{selected|token_id}
!roof flip dl-on @{target|RoofAnchor|token_id}
!roof flip -LVo7yDRijRbyShF5OeO
!roof flip dl-toggle fow-off -LuplpqmFMHrVmmxeEtF,-Lv3wJInyuS8zzr-0NCj
```

If you have provided information in the GM notes, it will only be sent to chat when a Roof token is revealed. When they are hidden, this information will not be shown. This allows for a "reset" of the trap or whatever effect you have created.

## Configuration
You can enter the Config Menu by sending `!roof config` in the chat. This dialog gives access to changing the following options:
* **Anchor Color** is the hexadecimal value of the aura applied to the RoofAnchor token. You may change this color to any valid hexadecimal color you wish using the button provided.
* **Aura** is the aura field to be used on the RoofAnchor token. If you are using your tokens' Aura 1 for a different purpose or another script is using them, you may change the Aura setting to use Aura 1 instead. To do this, just click the button provided.
* **Position Locking** allows you to lock the position, size and rotation of a Roof token whenever you link it with its RoofAnchor. This can be helpful on a crowded map or if there is a tendency to drag the wrong tokens. _This does not lock the RoofAnchor token._
   Roofs linked with position locking turned on will remain locked after this feature is disabled, so if you wish to unlock a roof token, send `!roof unlock` with the RoofAnchor token selected. This unlocks **all** roof tokens associated with that anchor.
   If you wish to lock Roof tokens for old Roofs or after unlocking them, select the corresponding RoofAnchor token and send `!roof lock` in chat.
* **GM Only** allows you to give players access to the `!roof flip` command. This allows more flexibility and creativity with the script, like creating player macros to let them change their environment.

## In-Chat Help
You may have [Setup](#setup) instructions based on your configuration settings given to you at any time by sending `!roof help` in chat.
