import LinkItem from './LinkItem';

const AutoLinkHOC = (Component) => {
  return (props) => {
    if (props.dontLink) return <Component {...props} />;
    return (
      <LinkItem>
        <Component {...props} />
      </LinkItem>
    );
  };
};
export default AutoLinkHOC;
