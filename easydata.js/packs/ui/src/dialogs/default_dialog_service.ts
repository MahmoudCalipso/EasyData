import { i18n } from '@easydata/core';

import { DialogService, DialogOptions } from "./dialog_service";

import { domel } from "../utils/dom_elem_builder";


const cssPrefix = "kdlg";

export class DefaultDialogService implements DialogService {

    public openConfirm(title?: string, content?: string): Promise<boolean>;
    public openConfirm(title?: string, content?: string, callback?: (result: boolean) => void): void;
    public openConfirm(title?: string, content?: string, callback?: (result: boolean) => void): Promise<boolean> | void {
        
        const template = `<div id="${cssPrefix}-dialog-confirm">${content}</div>`;

        const options: DialogOptions = {
            title: title,
            closable: false,
            cancelable: true,
            body: template
        }

        if (callback) {
            options.onSubmit = () => {
                callback(true);
            };
            options.onCancel = () => {
                callback(false);
            }

            this.open(options);
            return;
        }

        return new Promise<boolean>((resolve) => {
            options.onSubmit = () => {
                resolve(true);
            }
            options.onCancel = () => {
                resolve(false);
            }
            this.open(options);
        });
    }

    public openPrompt(title?: string, content?: string, defVal?: string): Promise<string>;
    public openPrompt(title?: string, content?: string, defVal?: string, callback?: (result: string) => void): void;
    public openPrompt(title?: string, content?: string, defVal?: string, callback?: (result: string) => void): Promise<string> | void {

        const template = `<div id="${cssPrefix}-dialog-form">
            <label for="name" id="${cssPrefix}-dialog-form-content">${content}</label>
            <input type="text" name="name" id="${cssPrefix}-dialog-form-input"" />
        </div>`;

        const options: DialogOptions = {
            title: title,
            closable: true,
            cancelable: true,
            body: template,
            beforeOpen: () => {
                const input = document.getElementById(`${cssPrefix}-dialog-form-input`) as HTMLInputElement;
                if (defVal) {
                    input.value = defVal;
                }
            }
        }

        const processInput = (callback) => {
            const input = document.getElementById(`${cssPrefix}-dialog-form-input`) as HTMLInputElement;
            const result = input.value;
            if (result && result.replace(/\s/g, '').length > 0) {
                callback(result);
                return true;
            }

            input.classList.add('eqjs-invalid');
            return false;
        }

        if (callback) {
            options.onSubmit = () => { 
               return processInput(callback);
            };
            options.onCancel = () => {
                callback("");
            }

            this.open(options);
            return;
        }

        return new Promise<string>((resolve) => {
            options.onSubmit = () => {
                return processInput(resolve);
            }
            options.onCancel = () => {
                resolve("");
            }
            this.open(options);
        });
    }

    public open(options: DialogOptions) {

        const destroy = () => {
            document.body.removeChild(builder.show().toDOM());

            if (options.onDestroy) {
                options.onDestroy();
            }
        }

        const cancelHandler = () => {
            if (options.onCancel) {
                options.onCancel();
            }

            destroy();
        } 

        const submitHandler = () => {
            if (options.onSubmit && options.onSubmit() === false) {
                return;
            }

            destroy();
        }

        const builder = 
            domel('div', document.body)
                .addClass('kdlg-modal', 'is-active')
                .addChild('div', b => b
                    .addClass('kdlg-modal-background')
                )
                .addChild('div', b => b
                    .addClass('kdlg-modal-window')
                    //.addClass(browserUtils.getMobileCssClass())
                    .addChild('header', b => {
                        b
                        .addClass('kdlg-header')
                        .addChild('p', b => b
                            .addClass('kdlg-header-title')
                            .addText(options.title)
                        );

                        if (options.closable !== false)
                            b.addChild('button', b => b
                                .addClass('kdlg-modal-close')
                                .on('click', () => {
                                    cancelHandler();
                                })
                            );
                    })
                    .addChild('section', b => { 
                        b
                        .addClass('kdlg-body')

                        if (typeof options.body === 'string') {
                            b.addHtml(options.body)
                        } 
                        else {
                            b.addChildElement(options.body);
                        }
                    })
                    .addChild('footer', b => {
                        b
                        .addClass('kdlg-footer', 'align-right')
                        .addChild('button', b => b
                            .addClass('kfrm-button', 'is-info')
                            .addText(i18n.getText('ButtonOK'))
                            .on('click', (e) => {
                                submitHandler();
                            })
                        )

                        if (options.cancelable !== false)
                            b
                            .addChild('button', builder => builder
                                .addClass('kfrm-button')
                                .addText(i18n.getText('ButtonCancel'))
                                .on('click', (e) => {
                                    cancelHandler();
                                })
                            )
                    })
            );

        if (options.beforeOpen) {
            options.beforeOpen();
        }

        builder.show();

        const windowDiv = builder.toDOM()
            .querySelector<HTMLElement>('.kdlg-modal-window');
            
        if (options.height) {
            windowDiv.style.height = `${options.height}px`;
        }
        if (options.width) {
            windowDiv.style.width = `${options.width}px`;
        }
    }
}