
import {fuzzySearch} from './src/utils/search';
import {joinWithAnd} from './src/utils/strings';


const items = [
    'hat',
    'shirt',
    'glove',
    'bat',
    'ball'
];

const searchTerm = 'ball';

console.log(JSON.stringify(fuzzySearch(searchTerm, items, items), null, 2));

console.log(joinWithAnd([]))
console.log(joinWithAnd(['abc']))
console.log(joinWithAnd(['abc', '123']))
console.log(joinWithAnd(['abc', '123', 'xyz']))
console.log(joinWithAnd(['abc', '123', 'xyz', '789']))
