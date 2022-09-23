import { activeEffect, track, trigger } from "./effect"

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}
export const mutableHandlers = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true
        }

        track(target, 'get', key)

        // 思考:为什么不用 return target[key]
        return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
        let oldValue = target[key]
        let result = Reflect.set(target, key, value)
        if (oldValue !== value) {
            //值不同 需要更新视图
            trigger(target, 'set', key, value, oldValue)
        }
        return result
    }
}

// 一个对象的某个属性 可以对应到多个effect 
//WeakMap {对象:Map:{name:Set}}