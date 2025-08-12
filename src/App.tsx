import { useState } from 'react';
import { Tabs } from './components/Tabs';
import { TabPanel } from './components/TabPanel';
import { PanelSelector } from './components/PanelSelector';
import { ScreenConfig } from './components/ScreenConfig';
import { ScreenVisualization } from './components/ScreenVisualization';
import { Results } from './components/Results';
import { Panel } from './types/panel';
import { useDatabase } from './hooks/useDatabase';
import { DatabaseStatus } from './components/DatabaseStatus';

const LOGO_URL = "https://cdn.discordapp.com/attachments/1105588640484184225/1105588730984673350/Av-teknikk_Logo.png?ex=6739a5fe&is=6738547e&hm=a061b352aab9ad52c5ba6b793e92785b8cfc7f21ff8ed145598fb50bd330b555&";

function App() {
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [horizontalPanels, setHorizontalPanels] = useState(1);
  const [verticalPanels, setVerticalPanels] = useState(1);
  const [numberingDirection, setNumberingDirection] = useState<'left' | 'right' | 'top' | 'bottom'>('left');
  const { panels, loading, error, apiStatus, savePanel, removePanel } = useDatabase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <img src={LOGO_URL} alt="AV Teknikk" className="h-16" />
        </div>
        
        <Tabs>
          <TabPanel label="Configuration">
            <div className="space-y-8">
              <PanelSelector 
                panels={panels}
                selectedPanel={selectedPanel}
                onPanelSelect={setSelectedPanel}
                onSavePanel={savePanel}
                onDeletePanel={removePanel}
                loading={loading}
                error={error}
              />
              
              {selectedPanel && (
                <ScreenConfig
                  horizontalPanels={horizontalPanels}
                  verticalPanels={verticalPanels}
                  selectedPanel={selectedPanel}
                  onHorizontalChange={setHorizontalPanels}
                  onVerticalChange={setVerticalPanels}
                />
              )}
            </div>
          </TabPanel>

          <TabPanel label="Visualization">
            {selectedPanel && (
              <ScreenVisualization
                panel={selectedPanel}
                horizontalPanels={horizontalPanels}
                verticalPanels={verticalPanels}
                numberingDirection={numberingDirection}
                onNumberingDirectionChange={setNumberingDirection}
              />
            )}
          </TabPanel>

          <TabPanel label="Results">
            {selectedPanel && (
              <Results
                panel={selectedPanel}
                horizontalPanels={horizontalPanels}
                verticalPanels={verticalPanels}
                logo={LOGO_URL}
                numberingDirection={numberingDirection}
                onNumberingDirectionChange={setNumberingDirection}
              />
            )}
          </TabPanel>
        </Tabs>
      </div>

      <DatabaseStatus status={apiStatus} error={error} />
    </div>
  );
}

export default App;
