import * as React from 'react';

type PureReactComponentProps = {
    dataThing: number;
    callback: () => void
}

const PureReactComponent = (props: PureReactComponentProps) => {
    return <div>Pure React Dummy Component {props.dataThing}
        <button onClick={() => props.callback()} >Pure React Button</button>
    </div>
}

export default PureReactComponent