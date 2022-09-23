import { isObject } from "@vue/shared"
import { activeEffect, track, trigger } from "./effect"
import { reactive } from "./reactive"

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
        let res = Reflect.get(target, key, receiver)

        if (isObject(res)) { //取值发现是object  继续代理 相比vue2 直接递归遍历代理 性能更好
            return reactive(res)
        }

        return res
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