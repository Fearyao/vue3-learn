import { isFunction } from "@vue/shared";
import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
    public effect
    private _dirty = true //computed是否需要重新计算 默认第一次直接计算
    private __v_isReadonly = true
    private __v_isRef = true

    public _value;

    constructor(public getter, public setter) {
        // getter放到 ReactiveEffect中  getter中的属性就会被这个effect收集依赖
        this.effect = new ReactiveEffect(getter, () => {

        })
    }

    get value() {
        if (this._dirty) {
            this._value = this.effect.run()
        }
        return this._value
    }
    set value(newValue) {
        this.setter(newValue)
    }
}


export const computed = (getterOrOptions) => {
    let onlyGetter = isFunction(getterOrOptions)
    let getter;
    let setter;
    if (onlyGetter) {
        getter = getterOrOptions
        setter = () => console.warn('cant set')
    } else {
        getter = getterOrOptions.get
        setter = getterOrOptions.set
    }

    return new ComputedRefImpl(getter, setter)
}