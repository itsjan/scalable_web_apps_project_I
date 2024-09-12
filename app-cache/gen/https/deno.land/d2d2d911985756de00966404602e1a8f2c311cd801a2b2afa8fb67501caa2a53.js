// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { assert } from "../_util/assert.ts";
const { hasOwn  } = Object;
function get(obj, key) {
    if (hasOwn(obj, key)) {
        return obj[key];
    }
}
function getForce(obj, key) {
    const v = get(obj, key);
    assert(v != null);
    return v;
}
function isNumber(x) {
    if (typeof x === "number") return true;
    if (/^0x[0-9a-f]+$/i.test(String(x))) return true;
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(String(x));
}
function hasKey(obj, keys) {
    let o = obj;
    keys.slice(0, -1).forEach((key)=>{
        o = get(o, key) ?? {};
    });
    const key = keys[keys.length - 1];
    return key in o;
}
/** Take a set of command line arguments, with an optional set of options, and
 * return an object representation of those argument.
 *
 * ```ts
 *      import { parse } from "./mod.ts";
 *      const parsedArgs = parse(Deno.args);
 * ```
 */ export function parse(args, { "--": doubleDash = false , alias ={} , boolean =false , default: defaults = {} , stopEarly =false , string =[] , unknown =(i)=>i  } = {}) {
    const flags = {
        bools: {},
        strings: {},
        unknownFn: unknown,
        allBools: false
    };
    if (boolean !== undefined) {
        if (typeof boolean === "boolean") {
            flags.allBools = !!boolean;
        } else {
            const booleanArgs = typeof boolean === "string" ? [
                boolean
            ] : boolean;
            for (const key of booleanArgs.filter(Boolean)){
                flags.bools[key] = true;
            }
        }
    }
    const aliases = {};
    if (alias !== undefined) {
        for(const key in alias){
            const val = getForce(alias, key);
            if (typeof val === "string") {
                aliases[key] = [
                    val
                ];
            } else {
                aliases[key] = val;
            }
            for (const alias of getForce(aliases, key)){
                aliases[alias] = [
                    key
                ].concat(aliases[key].filter((y)=>alias !== y));
            }
        }
    }
    if (string !== undefined) {
        const stringArgs = typeof string === "string" ? [
            string
        ] : string;
        for (const key of stringArgs.filter(Boolean)){
            flags.strings[key] = true;
            const alias = get(aliases, key);
            if (alias) {
                for (const al of alias){
                    flags.strings[al] = true;
                }
            }
        }
    }
    const argv = {
        _: []
    };
    function argDefined(key, arg) {
        return flags.allBools && /^--[^=]+$/.test(arg) || get(flags.bools, key) || !!get(flags.strings, key) || !!get(aliases, key);
    }
    function setKey(obj, keys, value) {
        let o = obj;
        keys.slice(0, -1).forEach(function(key) {
            if (get(o, key) === undefined) {
                o[key] = {};
            }
            o = get(o, key);
        });
        const key = keys[keys.length - 1];
        if (get(o, key) === undefined || get(flags.bools, key) || typeof get(o, key) === "boolean") {
            o[key] = value;
        } else if (Array.isArray(get(o, key))) {
            o[key].push(value);
        } else {
            o[key] = [
                get(o, key),
                value
            ];
        }
    }
    function setArg(key, val, arg = undefined) {
        if (arg && flags.unknownFn && !argDefined(key, arg)) {
            if (flags.unknownFn(arg, key, val) === false) return;
        }
        const value = !get(flags.strings, key) && isNumber(val) ? Number(val) : val;
        setKey(argv, key.split("."), value);
        const alias = get(aliases, key);
        if (alias) {
            for (const x of alias){
                setKey(argv, x.split("."), value);
            }
        }
    }
    function aliasIsBoolean(key) {
        return getForce(aliases, key).some((x)=>typeof get(flags.bools, x) === "boolean");
    }
    for (const key of Object.keys(flags.bools)){
        setArg(key, defaults[key] === undefined ? false : defaults[key]);
    }
    let notFlags = [];
    // all args after "--" are not parsed
    if (args.includes("--")) {
        notFlags = args.slice(args.indexOf("--") + 1);
        args = args.slice(0, args.indexOf("--"));
    }
    for(let i = 0; i < args.length; i++){
        const arg = args[i];
        if (/^--.+=/.test(arg)) {
            const m = arg.match(/^--([^=]+)=(.*)$/s);
            assert(m != null);
            const [, key, value] = m;
            if (flags.bools[key]) {
                const booleanValue = value !== "false";
                setArg(key, booleanValue, arg);
            } else {
                setArg(key, value, arg);
            }
        } else if (/^--no-.+/.test(arg)) {
            const m = arg.match(/^--no-(.+)/);
            assert(m != null);
            setArg(m[1], false, arg);
        } else if (/^--.+/.test(arg)) {
            const m = arg.match(/^--(.+)/);
            assert(m != null);
            const [, key] = m;
            const next = args[i + 1];
            if (next !== undefined && !/^-/.test(next) && !get(flags.bools, key) && !flags.allBools && (get(aliases, key) ? !aliasIsBoolean(key) : true)) {
                setArg(key, next, arg);
                i++;
            } else if (/^(true|false)$/.test(next)) {
                setArg(key, next === "true", arg);
                i++;
            } else {
                setArg(key, get(flags.strings, key) ? "" : true, arg);
            }
        } else if (/^-[^-]+/.test(arg)) {
            const letters = arg.slice(1, -1).split("");
            let broken = false;
            for(let j = 0; j < letters.length; j++){
                const next = arg.slice(j + 2);
                if (next === "-") {
                    setArg(letters[j], next, arg);
                    continue;
                }
                if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
                    setArg(letters[j], next.split(/=(.+)/)[1], arg);
                    broken = true;
                    break;
                }
                if (/[A-Za-z]/.test(letters[j]) && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                    setArg(letters[j], next, arg);
                    broken = true;
                    break;
                }
                if (letters[j + 1] && letters[j + 1].match(/\W/)) {
                    setArg(letters[j], arg.slice(j + 2), arg);
                    broken = true;
                    break;
                } else {
                    setArg(letters[j], get(flags.strings, letters[j]) ? "" : true, arg);
                }
            }
            const [key] = arg.slice(-1);
            if (!broken && key !== "-") {
                if (args[i + 1] && !/^(-|--)[^-]/.test(args[i + 1]) && !get(flags.bools, key) && (get(aliases, key) ? !aliasIsBoolean(key) : true)) {
                    setArg(key, args[i + 1], arg);
                    i++;
                } else if (args[i + 1] && /^(true|false)$/.test(args[i + 1])) {
                    setArg(key, args[i + 1] === "true", arg);
                    i++;
                } else {
                    setArg(key, get(flags.strings, key) ? "" : true, arg);
                }
            }
        } else {
            if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
                argv._.push(flags.strings["_"] ?? !isNumber(arg) ? arg : Number(arg));
            }
            if (stopEarly) {
                argv._.push(...args.slice(i + 1));
                break;
            }
        }
    }
    for (const key of Object.keys(defaults)){
        if (!hasKey(argv, key.split("."))) {
            setKey(argv, key.split("."), defaults[key]);
            if (aliases[key]) {
                for (const x of aliases[key]){
                    setKey(argv, x.split("."), defaults[key]);
                }
            }
        }
    }
    if (doubleDash) {
        argv["--"] = [];
        for (const key of notFlags){
            argv["--"].push(key);
        }
    } else {
        for (const key of notFlags){
            argv._.push(key);
        }
    }
    return argv;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjEzMi4wL2ZsYWdzL21vZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tIFwiLi4vX3V0aWwvYXNzZXJ0LnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXJncyB7XG4gIC8qKiBDb250YWlucyBhbGwgdGhlIGFyZ3VtZW50cyB0aGF0IGRpZG4ndCBoYXZlIGFuIG9wdGlvbiBhc3NvY2lhdGVkIHdpdGhcbiAgICogdGhlbS4gKi9cbiAgXzogQXJyYXk8c3RyaW5nIHwgbnVtYmVyPjtcbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFyZ1BhcnNpbmdPcHRpb25zIHtcbiAgLyoqIFdoZW4gYHRydWVgLCBwb3B1bGF0ZSB0aGUgcmVzdWx0IGBfYCB3aXRoIGV2ZXJ5dGhpbmcgYmVmb3JlIHRoZSBgLS1gIGFuZFxuICAgKiB0aGUgcmVzdWx0IGBbJy0tJ11gIHdpdGggZXZlcnl0aGluZyBhZnRlciB0aGUgYC0tYC4gSGVyZSdzIGFuIGV4YW1wbGU6XG4gICAqXG4gICAqIGBgYHRzXG4gICAqICAgICAgLy8gJCBkZW5vIHJ1biBleGFtcGxlLnRzIC0tIGEgYXJnMVxuICAgKiAgICAgIGltcG9ydCB7IHBhcnNlIH0gZnJvbSBcIi4vbW9kLnRzXCI7XG4gICAqICAgICAgY29uc29sZS5kaXIocGFyc2UoRGVuby5hcmdzLCB7IFwiLS1cIjogZmFsc2UgfSkpO1xuICAgKiAgICAgIC8vIG91dHB1dDogeyBfOiBbIFwiYVwiLCBcImFyZzFcIiBdIH1cbiAgICogICAgICBjb25zb2xlLmRpcihwYXJzZShEZW5vLmFyZ3MsIHsgXCItLVwiOiB0cnVlIH0pKTtcbiAgICogICAgICAvLyBvdXRwdXQ6IHsgXzogW10sIC0tOiBbIFwiYVwiLCBcImFyZzFcIiBdIH1cbiAgICogYGBgXG4gICAqXG4gICAqIERlZmF1bHRzIHRvIGBmYWxzZWAuXG4gICAqL1xuICBcIi0tXCI/OiBib29sZWFuO1xuXG4gIC8qKiBBbiBvYmplY3QgbWFwcGluZyBzdHJpbmcgbmFtZXMgdG8gc3RyaW5ncyBvciBhcnJheXMgb2Ygc3RyaW5nIGFyZ3VtZW50XG4gICAqIG5hbWVzIHRvIHVzZSBhcyBhbGlhc2VzICovXG4gIGFsaWFzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgc3RyaW5nW10+O1xuXG4gIC8qKiBBIGJvb2xlYW4sIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzIHRvIGFsd2F5cyB0cmVhdCBhcyBib29sZWFucy4gSWZcbiAgICogYHRydWVgIHdpbGwgdHJlYXQgYWxsIGRvdWJsZSBoeXBoZW5hdGVkIGFyZ3VtZW50cyB3aXRob3V0IGVxdWFsIHNpZ25zIGFzXG4gICAqIGBib29sZWFuYCAoZS5nLiBhZmZlY3RzIGAtLWZvb2AsIG5vdCBgLWZgIG9yIGAtLWZvbz1iYXJgKSAqL1xuICBib29sZWFuPzogYm9vbGVhbiB8IHN0cmluZyB8IHN0cmluZ1tdO1xuXG4gIC8qKiBBbiBvYmplY3QgbWFwcGluZyBzdHJpbmcgYXJndW1lbnQgbmFtZXMgdG8gZGVmYXVsdCB2YWx1ZXMuICovXG4gIGRlZmF1bHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICAvKiogV2hlbiBgdHJ1ZWAsIHBvcHVsYXRlIHRoZSByZXN1bHQgYF9gIHdpdGggZXZlcnl0aGluZyBhZnRlciB0aGUgZmlyc3RcbiAgICogbm9uLW9wdGlvbi4gKi9cbiAgc3RvcEVhcmx5PzogYm9vbGVhbjtcblxuICAvKiogQSBzdHJpbmcgb3IgYXJyYXkgb2Ygc3RyaW5ncyBhcmd1bWVudCBuYW1lcyB0byBhbHdheXMgdHJlYXQgYXMgc3RyaW5ncy4gKi9cbiAgc3RyaW5nPzogc3RyaW5nIHwgc3RyaW5nW107XG5cbiAgLyoqIEEgZnVuY3Rpb24gd2hpY2ggaXMgaW52b2tlZCB3aXRoIGEgY29tbWFuZCBsaW5lIHBhcmFtZXRlciBub3QgZGVmaW5lZCBpblxuICAgKiB0aGUgYG9wdGlvbnNgIGNvbmZpZ3VyYXRpb24gb2JqZWN0LiBJZiB0aGUgZnVuY3Rpb24gcmV0dXJucyBgZmFsc2VgLCB0aGVcbiAgICogdW5rbm93biBvcHRpb24gaXMgbm90IGFkZGVkIHRvIGBwYXJzZWRBcmdzYC4gKi9cbiAgdW5rbm93bj86IChhcmc6IHN0cmluZywga2V5Pzogc3RyaW5nLCB2YWx1ZT86IHVua25vd24pID0+IHVua25vd247XG59XG5cbmludGVyZmFjZSBGbGFncyB7XG4gIGJvb2xzOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPjtcbiAgc3RyaW5nczogUmVjb3JkPHN0cmluZywgYm9vbGVhbj47XG4gIHVua25vd25GbjogKGFyZzogc3RyaW5nLCBrZXk/OiBzdHJpbmcsIHZhbHVlPzogdW5rbm93bikgPT4gdW5rbm93bjtcbiAgYWxsQm9vbHM6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBOZXN0ZWRNYXBwaW5nIHtcbiAgW2tleTogc3RyaW5nXTogTmVzdGVkTWFwcGluZyB8IHVua25vd247XG59XG5cbmNvbnN0IHsgaGFzT3duIH0gPSBPYmplY3Q7XG5cbmZ1bmN0aW9uIGdldDxUPihvYmo6IFJlY29yZDxzdHJpbmcsIFQ+LCBrZXk6IHN0cmluZyk6IFQgfCB1bmRlZmluZWQge1xuICBpZiAoaGFzT3duKG9iaiwga2V5KSkge1xuICAgIHJldHVybiBvYmpba2V5XTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRGb3JjZTxUPihvYmo6IFJlY29yZDxzdHJpbmcsIFQ+LCBrZXk6IHN0cmluZyk6IFQge1xuICBjb25zdCB2ID0gZ2V0KG9iaiwga2V5KTtcbiAgYXNzZXJ0KHYgIT0gbnVsbCk7XG4gIHJldHVybiB2O1xufVxuXG5mdW5jdGlvbiBpc051bWJlcih4OiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgeCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHRydWU7XG4gIGlmICgvXjB4WzAtOWEtZl0rJC9pLnRlc3QoU3RyaW5nKHgpKSkgcmV0dXJuIHRydWU7XG4gIHJldHVybiAvXlstK10/KD86XFxkKyg/OlxcLlxcZCopP3xcXC5cXGQrKShlWy0rXT9cXGQrKT8kLy50ZXN0KFN0cmluZyh4KSk7XG59XG5cbmZ1bmN0aW9uIGhhc0tleShvYmo6IE5lc3RlZE1hcHBpbmcsIGtleXM6IHN0cmluZ1tdKTogYm9vbGVhbiB7XG4gIGxldCBvID0gb2JqO1xuICBrZXlzLnNsaWNlKDAsIC0xKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBvID0gKGdldChvLCBrZXkpID8/IHt9KSBhcyBOZXN0ZWRNYXBwaW5nO1xuICB9KTtcblxuICBjb25zdCBrZXkgPSBrZXlzW2tleXMubGVuZ3RoIC0gMV07XG4gIHJldHVybiBrZXkgaW4gbztcbn1cblxuLyoqIFRha2UgYSBzZXQgb2YgY29tbWFuZCBsaW5lIGFyZ3VtZW50cywgd2l0aCBhbiBvcHRpb25hbCBzZXQgb2Ygb3B0aW9ucywgYW5kXG4gKiByZXR1cm4gYW4gb2JqZWN0IHJlcHJlc2VudGF0aW9uIG9mIHRob3NlIGFyZ3VtZW50LlxuICpcbiAqIGBgYHRzXG4gKiAgICAgIGltcG9ydCB7IHBhcnNlIH0gZnJvbSBcIi4vbW9kLnRzXCI7XG4gKiAgICAgIGNvbnN0IHBhcnNlZEFyZ3MgPSBwYXJzZShEZW5vLmFyZ3MpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShcbiAgYXJnczogc3RyaW5nW10sXG4gIHtcbiAgICBcIi0tXCI6IGRvdWJsZURhc2ggPSBmYWxzZSxcbiAgICBhbGlhcyA9IHt9LFxuICAgIGJvb2xlYW4gPSBmYWxzZSxcbiAgICBkZWZhdWx0OiBkZWZhdWx0cyA9IHt9LFxuICAgIHN0b3BFYXJseSA9IGZhbHNlLFxuICAgIHN0cmluZyA9IFtdLFxuICAgIHVua25vd24gPSAoaTogc3RyaW5nKTogdW5rbm93biA9PiBpLFxuICB9OiBBcmdQYXJzaW5nT3B0aW9ucyA9IHt9LFxuKTogQXJncyB7XG4gIGNvbnN0IGZsYWdzOiBGbGFncyA9IHtcbiAgICBib29sczoge30sXG4gICAgc3RyaW5nczoge30sXG4gICAgdW5rbm93bkZuOiB1bmtub3duLFxuICAgIGFsbEJvb2xzOiBmYWxzZSxcbiAgfTtcblxuICBpZiAoYm9vbGVhbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHR5cGVvZiBib29sZWFuID09PSBcImJvb2xlYW5cIikge1xuICAgICAgZmxhZ3MuYWxsQm9vbHMgPSAhIWJvb2xlYW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGJvb2xlYW5BcmdzID0gdHlwZW9mIGJvb2xlYW4gPT09IFwic3RyaW5nXCIgPyBbYm9vbGVhbl0gOiBib29sZWFuO1xuXG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBib29sZWFuQXJncy5maWx0ZXIoQm9vbGVhbikpIHtcbiAgICAgICAgZmxhZ3MuYm9vbHNba2V5XSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgYWxpYXNlczogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0ge307XG4gIGlmIChhbGlhcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gYWxpYXMpIHtcbiAgICAgIGNvbnN0IHZhbCA9IGdldEZvcmNlKGFsaWFzLCBrZXkpO1xuICAgICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgYWxpYXNlc1trZXldID0gW3ZhbF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhbGlhc2VzW2tleV0gPSB2YWw7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IGFsaWFzIG9mIGdldEZvcmNlKGFsaWFzZXMsIGtleSkpIHtcbiAgICAgICAgYWxpYXNlc1thbGlhc10gPSBba2V5XS5jb25jYXQoYWxpYXNlc1trZXldLmZpbHRlcigoeSkgPT4gYWxpYXMgIT09IHkpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoc3RyaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBzdHJpbmdBcmdzID0gdHlwZW9mIHN0cmluZyA9PT0gXCJzdHJpbmdcIiA/IFtzdHJpbmddIDogc3RyaW5nO1xuXG4gICAgZm9yIChjb25zdCBrZXkgb2Ygc3RyaW5nQXJncy5maWx0ZXIoQm9vbGVhbikpIHtcbiAgICAgIGZsYWdzLnN0cmluZ3Nba2V5XSA9IHRydWU7XG4gICAgICBjb25zdCBhbGlhcyA9IGdldChhbGlhc2VzLCBrZXkpO1xuICAgICAgaWYgKGFsaWFzKSB7XG4gICAgICAgIGZvciAoY29uc3QgYWwgb2YgYWxpYXMpIHtcbiAgICAgICAgICBmbGFncy5zdHJpbmdzW2FsXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBhcmd2OiBBcmdzID0geyBfOiBbXSB9O1xuXG4gIGZ1bmN0aW9uIGFyZ0RlZmluZWQoa2V5OiBzdHJpbmcsIGFyZzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIChmbGFncy5hbGxCb29scyAmJiAvXi0tW149XSskLy50ZXN0KGFyZykpIHx8XG4gICAgICBnZXQoZmxhZ3MuYm9vbHMsIGtleSkgfHxcbiAgICAgICEhZ2V0KGZsYWdzLnN0cmluZ3MsIGtleSkgfHxcbiAgICAgICEhZ2V0KGFsaWFzZXMsIGtleSlcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0S2V5KG9iajogTmVzdGVkTWFwcGluZywga2V5czogc3RyaW5nW10sIHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgbGV0IG8gPSBvYmo7XG4gICAga2V5cy5zbGljZSgwLCAtMSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KTogdm9pZCB7XG4gICAgICBpZiAoZ2V0KG8sIGtleSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvW2tleV0gPSB7fTtcbiAgICAgIH1cbiAgICAgIG8gPSBnZXQobywga2V5KSBhcyBOZXN0ZWRNYXBwaW5nO1xuICAgIH0pO1xuXG4gICAgY29uc3Qga2V5ID0ga2V5c1trZXlzLmxlbmd0aCAtIDFdO1xuICAgIGlmIChcbiAgICAgIGdldChvLCBrZXkpID09PSB1bmRlZmluZWQgfHxcbiAgICAgIGdldChmbGFncy5ib29scywga2V5KSB8fFxuICAgICAgdHlwZW9mIGdldChvLCBrZXkpID09PSBcImJvb2xlYW5cIlxuICAgICkge1xuICAgICAgb1trZXldID0gdmFsdWU7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGdldChvLCBrZXkpKSkge1xuICAgICAgKG9ba2V5XSBhcyB1bmtub3duW10pLnB1c2godmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvW2tleV0gPSBbZ2V0KG8sIGtleSksIHZhbHVlXTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzZXRBcmcoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsOiB1bmtub3duLFxuICAgIGFyZzogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkLFxuICApOiB2b2lkIHtcbiAgICBpZiAoYXJnICYmIGZsYWdzLnVua25vd25GbiAmJiAhYXJnRGVmaW5lZChrZXksIGFyZykpIHtcbiAgICAgIGlmIChmbGFncy51bmtub3duRm4oYXJnLCBrZXksIHZhbCkgPT09IGZhbHNlKSByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdmFsdWUgPSAhZ2V0KGZsYWdzLnN0cmluZ3MsIGtleSkgJiYgaXNOdW1iZXIodmFsKSA/IE51bWJlcih2YWwpIDogdmFsO1xuICAgIHNldEtleShhcmd2LCBrZXkuc3BsaXQoXCIuXCIpLCB2YWx1ZSk7XG5cbiAgICBjb25zdCBhbGlhcyA9IGdldChhbGlhc2VzLCBrZXkpO1xuICAgIGlmIChhbGlhcykge1xuICAgICAgZm9yIChjb25zdCB4IG9mIGFsaWFzKSB7XG4gICAgICAgIHNldEtleShhcmd2LCB4LnNwbGl0KFwiLlwiKSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFsaWFzSXNCb29sZWFuKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGdldEZvcmNlKGFsaWFzZXMsIGtleSkuc29tZShcbiAgICAgICh4KSA9PiB0eXBlb2YgZ2V0KGZsYWdzLmJvb2xzLCB4KSA9PT0gXCJib29sZWFuXCIsXG4gICAgKTtcbiAgfVxuXG4gIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGZsYWdzLmJvb2xzKSkge1xuICAgIHNldEFyZyhrZXksIGRlZmF1bHRzW2tleV0gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogZGVmYXVsdHNba2V5XSk7XG4gIH1cblxuICBsZXQgbm90RmxhZ3M6IHN0cmluZ1tdID0gW107XG5cbiAgLy8gYWxsIGFyZ3MgYWZ0ZXIgXCItLVwiIGFyZSBub3QgcGFyc2VkXG4gIGlmIChhcmdzLmluY2x1ZGVzKFwiLS1cIikpIHtcbiAgICBub3RGbGFncyA9IGFyZ3Muc2xpY2UoYXJncy5pbmRleE9mKFwiLS1cIikgKyAxKTtcbiAgICBhcmdzID0gYXJncy5zbGljZSgwLCBhcmdzLmluZGV4T2YoXCItLVwiKSk7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBhcmcgPSBhcmdzW2ldO1xuXG4gICAgaWYgKC9eLS0uKz0vLnRlc3QoYXJnKSkge1xuICAgICAgY29uc3QgbSA9IGFyZy5tYXRjaCgvXi0tKFtePV0rKT0oLiopJC9zKTtcbiAgICAgIGFzc2VydChtICE9IG51bGwpO1xuICAgICAgY29uc3QgWywga2V5LCB2YWx1ZV0gPSBtO1xuXG4gICAgICBpZiAoZmxhZ3MuYm9vbHNba2V5XSkge1xuICAgICAgICBjb25zdCBib29sZWFuVmFsdWUgPSB2YWx1ZSAhPT0gXCJmYWxzZVwiO1xuICAgICAgICBzZXRBcmcoa2V5LCBib29sZWFuVmFsdWUsIGFyZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRBcmcoa2V5LCB2YWx1ZSwgYXJnKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKC9eLS1uby0uKy8udGVzdChhcmcpKSB7XG4gICAgICBjb25zdCBtID0gYXJnLm1hdGNoKC9eLS1uby0oLispLyk7XG4gICAgICBhc3NlcnQobSAhPSBudWxsKTtcbiAgICAgIHNldEFyZyhtWzFdLCBmYWxzZSwgYXJnKTtcbiAgICB9IGVsc2UgaWYgKC9eLS0uKy8udGVzdChhcmcpKSB7XG4gICAgICBjb25zdCBtID0gYXJnLm1hdGNoKC9eLS0oLispLyk7XG4gICAgICBhc3NlcnQobSAhPSBudWxsKTtcbiAgICAgIGNvbnN0IFssIGtleV0gPSBtO1xuICAgICAgY29uc3QgbmV4dCA9IGFyZ3NbaSArIDFdO1xuICAgICAgaWYgKFxuICAgICAgICBuZXh0ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgIS9eLS8udGVzdChuZXh0KSAmJlxuICAgICAgICAhZ2V0KGZsYWdzLmJvb2xzLCBrZXkpICYmXG4gICAgICAgICFmbGFncy5hbGxCb29scyAmJlxuICAgICAgICAoZ2V0KGFsaWFzZXMsIGtleSkgPyAhYWxpYXNJc0Jvb2xlYW4oa2V5KSA6IHRydWUpXG4gICAgICApIHtcbiAgICAgICAgc2V0QXJnKGtleSwgbmV4dCwgYXJnKTtcbiAgICAgICAgaSsrO1xuICAgICAgfSBlbHNlIGlmICgvXih0cnVlfGZhbHNlKSQvLnRlc3QobmV4dCkpIHtcbiAgICAgICAgc2V0QXJnKGtleSwgbmV4dCA9PT0gXCJ0cnVlXCIsIGFyZyk7XG4gICAgICAgIGkrKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldEFyZyhrZXksIGdldChmbGFncy5zdHJpbmdzLCBrZXkpID8gXCJcIiA6IHRydWUsIGFyZyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICgvXi1bXi1dKy8udGVzdChhcmcpKSB7XG4gICAgICBjb25zdCBsZXR0ZXJzID0gYXJnLnNsaWNlKDEsIC0xKS5zcGxpdChcIlwiKTtcblxuICAgICAgbGV0IGJyb2tlbiA9IGZhbHNlO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBsZXR0ZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBhcmcuc2xpY2UoaiArIDIpO1xuXG4gICAgICAgIGlmIChuZXh0ID09PSBcIi1cIikge1xuICAgICAgICAgIHNldEFyZyhsZXR0ZXJzW2pdLCBuZXh0LCBhcmcpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKC9bQS1aYS16XS8udGVzdChsZXR0ZXJzW2pdKSAmJiAvPS8udGVzdChuZXh0KSkge1xuICAgICAgICAgIHNldEFyZyhsZXR0ZXJzW2pdLCBuZXh0LnNwbGl0KC89KC4rKS8pWzFdLCBhcmcpO1xuICAgICAgICAgIGJyb2tlbiA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXG4gICAgICAgICAgL1tBLVphLXpdLy50ZXN0KGxldHRlcnNbal0pICYmXG4gICAgICAgICAgLy0/XFxkKyhcXC5cXGQqKT8oZS0/XFxkKyk/JC8udGVzdChuZXh0KVxuICAgICAgICApIHtcbiAgICAgICAgICBzZXRBcmcobGV0dGVyc1tqXSwgbmV4dCwgYXJnKTtcbiAgICAgICAgICBicm9rZW4gPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxldHRlcnNbaiArIDFdICYmIGxldHRlcnNbaiArIDFdLm1hdGNoKC9cXFcvKSkge1xuICAgICAgICAgIHNldEFyZyhsZXR0ZXJzW2pdLCBhcmcuc2xpY2UoaiArIDIpLCBhcmcpO1xuICAgICAgICAgIGJyb2tlbiA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0QXJnKGxldHRlcnNbal0sIGdldChmbGFncy5zdHJpbmdzLCBsZXR0ZXJzW2pdKSA/IFwiXCIgOiB0cnVlLCBhcmcpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IFtrZXldID0gYXJnLnNsaWNlKC0xKTtcbiAgICAgIGlmICghYnJva2VuICYmIGtleSAhPT0gXCItXCIpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGFyZ3NbaSArIDFdICYmXG4gICAgICAgICAgIS9eKC18LS0pW14tXS8udGVzdChhcmdzW2kgKyAxXSkgJiZcbiAgICAgICAgICAhZ2V0KGZsYWdzLmJvb2xzLCBrZXkpICYmXG4gICAgICAgICAgKGdldChhbGlhc2VzLCBrZXkpID8gIWFsaWFzSXNCb29sZWFuKGtleSkgOiB0cnVlKVxuICAgICAgICApIHtcbiAgICAgICAgICBzZXRBcmcoa2V5LCBhcmdzW2kgKyAxXSwgYXJnKTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJnc1tpICsgMV0gJiYgL14odHJ1ZXxmYWxzZSkkLy50ZXN0KGFyZ3NbaSArIDFdKSkge1xuICAgICAgICAgIHNldEFyZyhrZXksIGFyZ3NbaSArIDFdID09PSBcInRydWVcIiwgYXJnKTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0QXJnKGtleSwgZ2V0KGZsYWdzLnN0cmluZ3MsIGtleSkgPyBcIlwiIDogdHJ1ZSwgYXJnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWZsYWdzLnVua25vd25GbiB8fCBmbGFncy51bmtub3duRm4oYXJnKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgYXJndi5fLnB1c2goZmxhZ3Muc3RyaW5nc1tcIl9cIl0gPz8gIWlzTnVtYmVyKGFyZykgPyBhcmcgOiBOdW1iZXIoYXJnKSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RvcEVhcmx5KSB7XG4gICAgICAgIGFyZ3YuXy5wdXNoKC4uLmFyZ3Muc2xpY2UoaSArIDEpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZGVmYXVsdHMpKSB7XG4gICAgaWYgKCFoYXNLZXkoYXJndiwga2V5LnNwbGl0KFwiLlwiKSkpIHtcbiAgICAgIHNldEtleShhcmd2LCBrZXkuc3BsaXQoXCIuXCIpLCBkZWZhdWx0c1trZXldKTtcblxuICAgICAgaWYgKGFsaWFzZXNba2V5XSkge1xuICAgICAgICBmb3IgKGNvbnN0IHggb2YgYWxpYXNlc1trZXldKSB7XG4gICAgICAgICAgc2V0S2V5KGFyZ3YsIHguc3BsaXQoXCIuXCIpLCBkZWZhdWx0c1trZXldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChkb3VibGVEYXNoKSB7XG4gICAgYXJndltcIi0tXCJdID0gW107XG4gICAgZm9yIChjb25zdCBrZXkgb2Ygbm90RmxhZ3MpIHtcbiAgICAgIGFyZ3ZbXCItLVwiXS5wdXNoKGtleSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAoY29uc3Qga2V5IG9mIG5vdEZsYWdzKSB7XG4gICAgICBhcmd2Ll8ucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhcmd2O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxNQUFNLFFBQVEscUJBQXFCO0FBK0Q1QyxNQUFNLEVBQUUsT0FBTSxFQUFFLEdBQUc7QUFFbkIsU0FBUyxJQUFPLEdBQXNCLEVBQUUsR0FBVyxFQUFpQjtJQUNsRSxJQUFJLE9BQU8sS0FBSyxNQUFNO1FBQ3BCLE9BQU8sR0FBRyxDQUFDLElBQUk7SUFDakIsQ0FBQztBQUNIO0FBRUEsU0FBUyxTQUFZLEdBQXNCLEVBQUUsR0FBVyxFQUFLO0lBQzNELE1BQU0sSUFBSSxJQUFJLEtBQUs7SUFDbkIsT0FBTyxLQUFLLElBQUk7SUFDaEIsT0FBTztBQUNUO0FBRUEsU0FBUyxTQUFTLENBQVUsRUFBVztJQUNyQyxJQUFJLE9BQU8sTUFBTSxVQUFVLE9BQU8sSUFBSTtJQUN0QyxJQUFJLGlCQUFpQixJQUFJLENBQUMsT0FBTyxLQUFLLE9BQU8sSUFBSTtJ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