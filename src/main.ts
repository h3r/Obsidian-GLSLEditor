//https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines

import { App, Editor, MarkdownView, Menu, Modal, Notice, Plugin, PluginSettingTab, Setting, MarkdownPostProcessorContext, MarkdownRenderer, TFile, setIcon } from 'obsidian';

const glsllib = require('glslEditor/src/js/GlslEditor.js');

interface GLSLEditorSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: GLSLEditorSettings = {
	mySetting: 'default'
}

export default class GLSLEditorPlugin extends Plugin {
	settings: GLSLEditorSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor('glsl-editor', this.glslEditor.bind(this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async getVertexStage(source: string){
		return null;
	}

	async getFragmentStage(source: string){
		return source;
	}

	async getImportedHeader(source: string){
		return null;
	}

	// @ts-ignore
	async glslEditor(source: string, el:HTMLElement, _ctx: MarkdownPostProcessorContext) {

		let toolbar = el.createEl('div', { cls: 'glsl-toolbar' });
		let editor = el.createEl('div', { cls: 'glsl-editor' });

		//const editor = this.app.workspace.activeLeaf.view as MarkdownView;
		let glsEditor = new glsllib.default(editor, {
			canvas_size: 500,
			canvas_draggable: false,
			theme: 'monokai',
			multipleBuffers: true,
			watchHash: true,
			fileDrops: true,
			menu: false,
			frag: await this.getFragmentStage(source),
			frag_header: await this.getImportedHeader(source),
			imgs: [], //this.canvas.setUniform("u_tex" + i, this.options.imgs[i]);
		});
		glsEditor.lastSavedContent = source;

		let btnSave   = toolbar.createEl('button', { text: 'Save ', cls: 'glsl-btn-save', attr: { title: 'Save the shader' }});
		let btnReload = toolbar.createEl('button', { text: 'Reload', cls: 'glsl-btn-reload', attr: { title: 'Reload the shader' }});
		let btnTest   = toolbar.createEl('button', { text: 'Test', cls: 'glsl-btn-test', attr: { title: 'Test the shader' }});
		
		setIcon(btnSave, 'save');
		setIcon(btnReload, 'refresh-ccw');	
		setIcon(btnTest, 'play');

		const updateBlockContents = async (editor: any, newContent: string,  ctx:MarkdownPostProcessorContext) => {
			const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath);

			if (file instanceof TFile) {
				const fileContent = await this.app.vault.read(file);
				const fileLines = fileContent.split("\n");

				const sectionInfo = ctx.getSectionInfo(el);
				if (!sectionInfo) return;
				const { lineStart, lineEnd } = sectionInfo;

				const updatedLines = [
					...fileLines.slice(0, lineStart+1),   // All lines before the code block
					newContent,                         // The new code block content
					...fileLines.slice(lineEnd)     // All lines after the code block
				];
				await this.app.vault.modify(file, updatedLines.join("\n"));

				editor.lastSavedContent = newContent;
			}
		};
		const onSaveBtn = async (app:any, ctx:MarkdownPostProcessorContext, el:HTMLElement, editor: any) => { 
			const newContent = editor.editor.getValue();
			if (newContent && editor.lastSavedContent == newContent) return;
			new Notice('Saving GLSLEditor contents...');
			updateBlockContents(editor, newContent, ctx);
		};
		const onReloadBtn = async (app:any, ctx:MarkdownPostProcessorContext, el:HTMLElement, editor: any) => { 
			new Notice('Reloading GLSLEditor contents...');
			updateBlockContents(editor, editor.lastSavedContent, ctx);
		};
		const onTestBtn = async (app:any, ctx:MarkdownPostProcessorContext, el:HTMLElement, editor: any) => { 
			editor.visualDebugger.check()
		};
		
		btnTest.onclick   = onTestBtn.bind(this, this.app, _ctx, el, glsEditor);
		btnSave.onclick   = onSaveBtn.bind(this, this.app, _ctx, el, glsEditor);
		btnReload.onclick = onReloadBtn.bind(this, this.app, _ctx, el, glsEditor);
	}
}
