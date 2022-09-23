export let activeEffect = undefined

function cleanupEffect(effect) {
    const { deps } = effect
    for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect)
    }

    //思考 :为什么不 effect.dep=[]
}

export class ReactiveEffect {
    public parent = null //上一级的effect
    public active = true // 这个effect是默认激活状态
    public deps = [] // 记录这个effect对应哪些属性

    constructor(public fn, public scheduler) {
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

            //执行fn之前 清除之前收集的内容
            cleanupEffect(this)

            return this.fn()
        } finally {
            activeEffect = this.parent
        }

    }

    stop() {
        if (this.active) {
            this.active = false
            cleanupEffect(this)
        }
    }
}

export function effect(fn, options: any = {}) {

    // fn可以更具状态变化重新执行 effect可以嵌套写
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run() //默认执行一次

    const runner = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
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
}

//触发更新
export function trigger(target, type, key, value, oldValue) {
    const depsMap = targetMap.get(target)
    if (!depsMap) {
        //触发的值不在模板中使用
        return
    }
    let effects = depsMap.get(key)

    if (effects) {
        effects = new Set(effects)
    }
    effects.forEach(effect => {

        // 防止effect自己调用自己 无限调用
        if (effect !== activeEffect) {
            if (effect.scheduler) {
                effect.scheduler()
            } else {
                effect.run()
            }
        }
    });
}
