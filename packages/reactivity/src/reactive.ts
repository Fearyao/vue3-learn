import { isObject } from "@vue/shared";
import { mutableHandlers, ReactiveFlags } from "./baseHandles";



//将数据转化为响应式数据
export const reactiveMap = new WeakMap() //WeakMap key只能是对象

export function reactive(target) {
    if (!isObject(target)) {
        return
    }

    if (target[ReactiveFlags.IS_REACTIVE]) {
        return target
    }

    const exisitingProxy = reactiveMap.get(target)
    if (exisitingProxy) {
        return exisitingProxy
    }

    const proxy = new Proxy(target, mutableHandlers)
    reactiveMap.set(target, proxy)

    return proxy
}
