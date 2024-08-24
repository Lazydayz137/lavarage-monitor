
/*
Example:

const xyz = {abc: false}
useEffects('0x1234', (effects: any) => {
  if (effects.abc) {}// do something}
}, xyz)
xyz.abc = true
*/
let i = 0
interface NonPrimitive {
  [key: string]: JSONValue;
}
interface JSONArray extends Array<JSONValue> {}
type JSONValue = string | number | boolean | null | NonPrimitive | JSONArray;

const effectsTable: Record<string, {
  func: Function, effects: NonPrimitive
}> = {}
export default function useEffects(key: string, func: (effects: any) => void, effects: NonPrimitive, property?: string) {
  if (effectsTable[key]) throw "Effect already exist";
  else {
    // store the record
    effectsTable[key] = { func, effects: JSON.parse(JSON.stringify(effects)) }
    console.log('registered effect:', key)
  }
  const validate = () => {
    if (JSON.stringify(effects) != JSON.stringify(effectsTable[key].effects)) {
      if (property && effectsTable[key].effects[property] == effects[property]) {
        setTimeout(validate, 100)
        return
      }
      console.log('change detected:', key, ++i)
      try {
        func(effects)
      } catch (e) { console.error(e) }
      effectsTable[key].effects = JSON.parse(JSON.stringify(effects))
    }
    setTimeout(validate, 100)
  }

  validate()
}
