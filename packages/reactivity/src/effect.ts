export let activeEffect = undefined

class ReactiveEffect {
    active = true // 这个effect是默认激活状态
    constructor(public fn) {
        //public fn  等价  this.fn = fn
    }
    run() { //run 就是执行effect

        //非激活状态 只需要执行函数 无需依赖收集
        if (this.active) {
            return this.fn()
        }
        //依赖收集 核心就是将当前的effect和稍后渲染的属性关联起来
        try {
            activeEffect = this
            return this.fn()
        } finally {
            activeEffect = undefined
        }

    }
}

export function effect(fn) {
    // fn可以更具状态变化重新执行 effect可以嵌套写
    const _effect = new ReactiveEffect(fn);
    _effect.run() //默认执行一次
}