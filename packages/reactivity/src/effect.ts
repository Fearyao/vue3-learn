export let activeEffect = undefined

class ReactiveEffect {
    public parent = null //上一级的effect
    public active = true // 这个effect是默认激活状态
    public deps = [] // 记录这个effect对应哪些属性

    constructor(public fn) {
        //public fn  等价  this.fn = fn
    }
    run() { //run 就是执行effect
        //非激活状态 只需要执行函数 无需依赖收集
        if (!this.active) {
            return this.fn()
        }
        //依赖收集 核心就是将当前的effect和稍后渲染的属性关联起来
        try {
            this.parent = activeEffect
            activeEffect = this
            return this.fn()
        } finally {
            activeEffect = this.parent
        }

    }
}

export function effect(fn) {
    // fn可以更具状态变化重新执行 effect可以嵌套写
    const _effect = new ReactiveEffect(fn);
    _effect.run() //默认执行一次
}


// 一个对象的某个属性 可以对应到多个effect组成的Set
//WeakMap {对象:Map:{name:Set}}
// { 
//     { name: 'AA', age: 16 }: { 
//         name: [someEffect],
//         age:[someEffect]
//     } 
// }
const targetMap = new WeakMap();
//收集依赖
export function track(target, type, key) {
    if (!activeEffect) { return }

    let depsMap = targetMap.get(target)

    if (!depsMap) {
        targetMap.set(target, depsMap = new Map())
    }

    let dep = depsMap.get(key)
    if (!dep) {
        depsMap.set(key, dep = new Set())
    }

    let shouldTrack = !dep.has(key)
    if (shouldTrack) {
        //这里属性记录了effect
        dep.add(activeEffect)
        // 反向记录 让effect记录被哪些属性收集,这样处理是为了可以清理
        activeEffect.deps.push(dep)
    }

    console.log('%c⧭', 'color: #00a3cc', targetMap);
}

//触发更新
export function trigger(target, type, key, value, oldValue) {
    const depsMap = targetMap.get(target)
    if (!depsMap) {
        //触发的值不在模板中使用
        return
    }
    const effects = depsMap.get(key)
    effects && effects.forEach(effect => {

        // 防止effect自己调用自己 无限调用
        if (effect !== activeEffect) {
            effect.run()
        }
    });
}
