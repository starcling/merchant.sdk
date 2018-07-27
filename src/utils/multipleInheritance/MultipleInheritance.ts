// tslint:disable-next-line:variable-name
export const MultipleInheritance = (baseClass, ...mixins) => {
    // tslint:disable-next-line:class-name
    class base extends baseClass {
        // tslint:disable-next-line:typedef
        constructor(...args) {
            super(...args);
            mixins.forEach((mixin) => {
                // tslint:disable-next-line:new-parens
                copyProps(this, (new mixin));
            });
        }
    }
    const copyProps = (target, source) => {  // this function copies all properties and symbols, filtering out some special ones
        Object.getOwnPropertyNames(source)
            .concat(Array.prototype.concat(Object.getOwnPropertySymbols(source)))
            .forEach((prop) => {
                if (!prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
                    Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
                }
            });
    };
    mixins.forEach((mixin) => { // outside contructor() to allow aggregation(A,B,C).staticFunction() to be called etc.
        copyProps(base.prototype, mixin.prototype);
        copyProps(base, mixin);
    });
    return base;
};