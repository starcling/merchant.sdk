"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultipleInheritance = (baseClass, ...mixins) => {
    class base extends baseClass {
        constructor(...args) {
            super(...args);
            mixins.forEach((mixin) => {
                copyProps(this, (new mixin));
            });
        }
    }
    const copyProps = (target, source) => {
        Object.getOwnPropertyNames(source)
            .concat(Array.prototype.concat(Object.getOwnPropertySymbols(source)))
            .forEach((prop) => {
            if (!prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
                Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
            }
        });
    };
    mixins.forEach((mixin) => {
        copyProps(base.prototype, mixin.prototype);
        copyProps(base, mixin);
    });
    return base;
};
//# sourceMappingURL=MultipleInheritance.js.map