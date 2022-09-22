import { activeEffect } from "./effect"

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}
export const mutableHandlers = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true
        }

        // 思考:为什么不用 return target[key]
        return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
        Reflect.set(target, key, value)
        return true
    }
}