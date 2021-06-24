import {useState} from 'react'
import Button from 'react-bootstrap/Button'

const Filter = ({filter, onDelete}) => (
  <span className="Filter">
    {filter} <button onClick={onDelete}>x</button>
  </span>
)

const FilterInput = ({
  inputPlaceholder = 'Enter Filter (example: US, $100-$1,000...)'
}) => {
  const [filters, setFilters] = useState([])
  const [newFilter, setNewFilter] = useState('')
  const [appliedFilters, setApplied] = useState([])

  const handleChange = (e) => {
    setNewFilter(e.target.value)
  }

  const handleKeyDown = (e) => {
    if (e.keyCode === 32 && e.target.value !== '') {
      let filter = newFilter.trim()

      if (filters.indexOf(filter) === -1) {
        let updatedFilters = [...filters]
        updatedFilters.push(filter)
        setFilters(updatedFilters)
        setNewFilter('')
      }
      e.target.value = ''
    } else if (e.keyCode === 13) {
      setApplied([...appliedFilters, ...filters])
      setFilters([])
    }
  }

  const handleRemoveFilter = (e) => {
    let filter = e.target.parentNode.textContent.trim()
    let index = filters.indexOf(filter)
    let updatedFilters = [...filters]
    updatedFilters.splice(index, 1)
    setFilters(updatedFilters)
    setNewFilter({newTag: ''})
  }

  const handleRemoveApplied = (e) => {
    let filter = e.target.parentNode.textContent.trim()
    let index = appliedFilters.indexOf(filter)
    let updatedApplied = [...appliedFilters]
    updatedApplied.splice(index, 1)
    setApplied(updatedApplied)
  }

  return (
    <>
      <div className="Filter-Input">
        {filters.map((filter, index) => (
          <Filter key={index} filter={filter} onDelete={handleRemoveFilter} />
        ))}
        <input
          type="text"
          placeholder={filters.length === 0 ? inputPlaceholder : ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <Button
          className="bg-dark text-white border-0"
          onClick={() => {
            setApplied([...appliedFilters, ...filters])
            setFilters([])
          }}
        >
          APPLY FILTERS
        </Button>
      </div>
      {appliedFilters.length !== 0 && (
        <div>
          {appliedFilters.map((filter, index) => (
            <Filter key={index} filter={filter} onDelete={handleRemoveApplied} />
          ))}
          <span className="text-dark clear" onClick={() => setApplied([])}>
            CLEAR ALL
          </span>
        </div>
      )}
    </>
  )
}

export default FilterInput
