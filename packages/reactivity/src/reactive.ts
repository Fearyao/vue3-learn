import { isObject } from "@vue/shared";

//将数据转化为响应式数据
export function reactive(target) {
    if (!isObject(target)) {
        return
    }

    const proxy = new Proxy(target, {
        get(target, key, receiver) {

            console.log('%c⧭', 'color: #e50000', 'getvalue');
            // 思考:为什么不用 return target[key]
            return Reflect.get(target, key, receiver)
        },
        set(target, key, value, receiver) {
            console.log('%c⧭', 'color: #733d00', 'setvalue');
            Reflect.set(target, key, value)
            return true
        }
    })

    return proxy

}
