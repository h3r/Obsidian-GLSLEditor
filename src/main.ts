//https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines

import { App, Editor, MarkdownView, Menu, Modal, Notice, Plugin, PluginSettingTab, Setting, MarkdownPostProcessorContext, MarkdownRenderer, TFile, setIcon } from 'obsidian';

const glsllib = require('glslEditor/src/js/GlslEditor.js');

// Remember to rename these classes and interfaces!

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
		

		/*// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		
		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
		\*/
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: GLSLEditorPlugin;

	constructor(app: App, plugin: GLSLEditorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
