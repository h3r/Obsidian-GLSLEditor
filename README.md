# Obsidian-GLSLEditor
A glsl shader editor directly embedded on your obsidian notes. A tiny implementation of the amazing [glslEditor](https://github.com/patriciogonzalezvivo/glslEditor) from [@patriciogonzalezvivo](https://github.com/patriciogonzalezvivo). 

## Why?
Years ago when I started playing with shaders, one of my nicest soures of info was [TheBookOfShaders](https://thebookofshaders.com/) wich not only has detailed information about noises, parametric functions and etc, but also lets you play with it in real time. As soon I started playing with obsidian couldnt stop thinking on ways to build my own library of shaders in a similar way, until today :D

## Support
If you find this project helpful, you can support me by buying me a coffee:</br>
<a href="https://www.buymeacoffee.com/hplass"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=hplass&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>

## Usage:
Create an editor placing a `glsl-editor` block 
![alt text](image-1.png)
![alt text](image.png)
- Shaders are not automatically saved, press save buton to keep your changes
- If you want to revert to last saved state, press the reload button
- Pressing play, the editor will display the cumulative result line by line

## Future steps:
- Support for more uniforms and dynamic params
- Add support for texture binding
- Currently vertex shader its not editable
- Currently only a quad mesh is available

