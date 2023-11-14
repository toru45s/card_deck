class CustomToolbar {

    constructor() {
        const $this = this;
        this.modules = {
            toolbar: {
                container: [
                    [{'header': [1, 2, 3, 4, 5, 6, false]}],
                    ['bold', 'italic', 'underline'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    ['link', 'image'],
                    [{'align': []}],
                    [{'direction': 'rtl'}],
                    ['raw']
                ],
                handlers: {
                    'raw': function () {
                        $this.toggleRaw(this.quill);
                    }
                },
                html: true
            },
        };
    }

    toggleRaw($this) {
        $this.container.parentNode.parentNode.classList.toggle('showSource');
        this.modules.toolbar.html = !this.modules.toolbar.html;
    }

    getModules() {
        return this.modules;
    }

}

export default CustomToolbar;
