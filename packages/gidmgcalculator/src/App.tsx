import { Demo, DemoProps } from "rond";

function App() {
  const demoProps: DemoProps = {
    text: "Hello",
  };

  return (
    <div>
      <p>GI DMG Calculator App</p>
      <Demo {...demoProps} />
    </div>
  );
}

export default App;
