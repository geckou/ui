import { App } from 'vue'

// Form / UI components
import TextBox from '@/components/TextBox.vue'
import TextArea from '@/components/TextArea.vue'
import BasicButton from '@/components/BasicButton.vue'
import SelectBox from '@/components/SelectBox.vue'
import CheckBox from '@/components/CheckBox.vue'
import CheckBoxes from '@/components/CheckBoxes.vue'
import CheckButton from '@/components/CheckButton.vue'
import LabeledCheckbox from '@/components/LabeledCheckbox.vue'
import LabeledFieldset from '@/components/LabeledFieldset.vue'
import RadioButtons from '@/components/RadioButtons.vue'
import ToggleButton from '@/components/ToggleButton.vue'
import InputBox from '@/components/InputBox.vue'
import InputGroup from '@/components/InputGroup.vue'
import TextButton from '@/components/TextButton.vue'
import DatePicker from '@/components/DatePicker.vue'
import DateRangePicker from '@/components/DateRangePicker.vue'
import DateSelector from '@/components/DateSelector.vue'
import DropdownUi from '@/components/DropdownUi.vue'
import ModalBox from '@/components/ModalBox.vue'
import PopupBox from '@/components/PopupBox.vue'
import SlideDownUi from '@/components/SlideDownUi.vue'
import TabUI from '@/components/TabUI.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

// ArticleList components
import StandardList from '@/components/ArticleList/List/Standard.vue'
import RoundedList from '@/components/ArticleList/List/Rounded.vue'
import ArtisticList from '@/components/ArticleList/List/Artistic.vue'
import TileList from '@/components/ArticleList/List/Tile.vue'
import SimpleList from '@/components/ArticleList/List/Simple.vue'
import RowList from '@/components/ArticleList/List/Row.vue'
import NewsList from '@/components/ArticleList/List/News.vue'
import EntertainmentList from '@/components/ArticleList/List/Entertainment.vue'
import GalleryList from '@/components/ArticleList/List/Gallery.vue'
import GridList from '@/components/ArticleList/List/Grid.vue'

const components = {
  TextBox,
  TextArea,
  BasicButton,
  SelectBox,
  CheckBox,
  CheckBoxes,
  CheckButton,
  LabeledCheckbox,
  LabeledFieldset,
  RadioButtons,
  ToggleButton,
  InputBox,
  InputGroup,
  TextButton,
  DatePicker,
  DateRangePicker,
  DateSelector,
  DropdownUi,
  ModalBox,
  PopupBox,
  SlideDownUi,
  TabUI,
  LoadingSpinner,
  ErrorMessage,

  StandardList,
  RoundedList,
  ArtisticList,
  TileList,
  SimpleList,
  RowList,
  NewsList,
  EntertainmentList,
  GalleryList,
  GridList,
}

export default {
  install(app: App) {
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component)
    })
  },
}

export {
  TextBox,
  TextArea,
  BasicButton,
  SelectBox,
  CheckBox,
  CheckBoxes,
  CheckButton,
  LabeledCheckbox,
  LabeledFieldset,
  RadioButtons,
  ToggleButton,
  InputBox,
  InputGroup,
  TextButton,
  DatePicker,
  DateRangePicker,
  DateSelector,
  DropdownUi,
  ModalBox,
  PopupBox,
  SlideDownUi,
  TabUI,
  LoadingSpinner,
  ErrorMessage,

  StandardList,
  RoundedList,
  ArtisticList,
  TileList,
  SimpleList,
  RowList,
  NewsList,
  EntertainmentList,
  GalleryList,
  GridList,
}

export { LIST_THEME } from '@/const/list-theme'
export { FormValidationManager } from '@/scripts/form-validation-manager'
