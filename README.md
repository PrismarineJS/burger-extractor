# Burger-extractor

Extracted [minecraft-data](https://github.com/PrismarineJS/minecraft-data) from [burger](https://github.com/mcdevs/burger) json files.

Current data extracted:

- Biomes
- Blocks
- Entities
- Items
- Recipes

## How it works

This extractor merges previous version data with the new data extracted from burger.

Right now, there's quite a conversion process going on on the block merger as with the 1.13 update, a lot of block names have changed but still have the same properties, the code there tries to get this properties automatically. See [Flattening](https://minecraft.gamepedia.com/1.13/Flattening) for more info.

For future updates, this process of guessing the old block name won't be required as we don't expect any more block name changes, just new blocks.

This extractor also has the caveat that if for example, an already existing block changes one of it's properties, it won't be updated on the extracted data. Right now changes like this should be handled specifically either by code or by manually modifying the extracted json files.


## Usage

```bash
$ node src/index <burger file> <old version>
```

## Example

```bash
$ node src/index burger.json 1.12
```
