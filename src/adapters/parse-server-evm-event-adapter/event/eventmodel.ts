import { getRecord } from '../../../lib/parse/parsequery';
import * as Parse from 'parse/node';

const Syncs = Parse.Object.extend("Syncs");

// get all sync tags
export async function getSyncTag(tagName: string) {
    const qo = await getRecord('Syncs', 'tag', tagName );
    if(!qo) return 0;
    if (!qo.get('value')) qo.set('value', 0);
    return 0;
}

// get all sync tags
export async function setSyncTag(tagName: string, tagValue: string) {
    const o = await getRecord('Syncs', 'tag', tagName );
    if(!o) return null;
    o.set('value', tagValue);
    await o.save();
    return o;
}

module.exports = {
    getSyncTag,
    setSyncTag
}
