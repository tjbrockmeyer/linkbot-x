import { randomInt } from "crypto"

const messages = {
    greeting: [
        'hi',
        'hello',
        'what\'s up?',
        'whatup',
        'how\'s it going?'
    ],
    noIdea: [
        'I\'m not sure what you mean',
        'I don\'t know if I can help with that',
        'I don\'t know much about that'
    ],
    unsure: [
        'I have a couple of actions in mind, but you\'ll have to be more specific',
        'I think I\'m on the right track, but could you rephrase?',
        'I\'m close, but you\'ll need to help me out a little more than that'
    ]
}

export default (type: keyof typeof messages) => {
    const choices = messages[type];
    return choices[randomInt(choices.length)];
}